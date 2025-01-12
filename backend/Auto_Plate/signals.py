import os

from django.db.models.signals import post_delete,post_save
from django.dispatch import receiver

from Auto_Plate.models import Vehicle, ParkingLotRecord, Resident


@receiver(post_delete, sender=Vehicle)
def update_parking_lot_on_vehicle_delete(sender, instance, **kwargs):
    print(f"Vehicle {instance.plate_number}: Status = {instance.status}, Parking Lot = {instance.parking_lot}")
    """Update parking lot occupancy when a vehicle is deleted."""
    if instance.status == 'in' and instance.parking_lot:
        parking_lot = instance.parking_lot
        print(f"Before deletion: Parking Lot '{parking_lot.name}' - Occupied: {parking_lot.current_occupancy}, Vehicle: {instance.plate_number}")
        if parking_lot.current_occupancy > 0:
            parking_lot.current_occupancy -= 1
            parking_lot.save()
            print(
                f"After deletion: Parking Lot '{parking_lot.name}' - Occupied: {parking_lot.current_occupancy}, Vehicle: {instance.plate_number}")
        else:
            print(f"Parking lot occupancy is already zero for: {parking_lot.name}")
    else:
        print(f"Vehicle {instance.plate_number} is not marked as 'in' or has no associated parking lot.")

@receiver(post_save, sender=Vehicle)
def update_parking_lot_on_vehicle_save(sender, instance, created, **kwargs):
    """
    Signal to update parking lot occupancy and create a parking lot record
    when a vehicle is added or updated with status 'in'.
    """
    print(f"Vehicle {instance.plate_number}: Status = {instance.status}, Parking Lot = {instance.parking_lot}")

    if instance.status == 'in' and instance.parking_lot:
        parking_lot = instance.parking_lot

        # If the vehicle is newly created or its status changed to 'in'
        if created or (kwargs.get('update_fields') and 'status' in kwargs['update_fields']):
            # Increment the parking lot occupancy
            parking_lot.current_occupancy += 1
            parking_lot.save()

            # Create a new parking lot record
            ParkingLotRecord.objects.create(
                vehicle=instance,
                parking_lot=parking_lot,
                status='in',
                entry_time=instance.created_at,
            )

            print(f"Parking lot '{parking_lot.name}' updated and new parking lot record created for vehicle {instance.plate_number}.")



@receiver(post_delete, sender=Resident)
def delete_photo_on_resident_delete(sender, instance, **kwargs):
    """Delete the photo file when a Resident instance is deleted."""
    if instance.photo:
        photo_path = instance.photo.path
        if os.path.isfile(photo_path):
            os.remove(photo_path)

