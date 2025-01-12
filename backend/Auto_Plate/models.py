import os

from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.contrib.auth import get_user_model



class UserManager(BaseUserManager):
    def create_user(self, full_name, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(full_name=full_name, email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, full_name, email, password=None, **extra_fields):
        extra_fields.setdefault('role', 'admin')
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(full_name, email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    full_name = models.CharField(max_length=150, unique=False)
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=64, choices=(('admin', 'Admin'), ('user', 'User')))
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    is_resident = models.BooleanField(default=False)


    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['full_name']


    @property
    def is_staff(self):
        return self.is_superuser or self.role == 'admin'


class Resident(models.Model):
    full_name = models.CharField(max_length=150)
    phone_number = models.CharField(max_length=15, unique=True)
    photo = models.ImageField(upload_to='resident_photos/', null=True, blank=True)


    def __str__(self):
        vehicle_count = self.vehicles.count()
        return f"{self.full_name} - {self.phone_number} - {vehicle_count} vehicles"


class ParkingLot(models.Model):
    name = models.CharField(max_length=150,unique=True)
    location = models.CharField(max_length=300)
    capacity = models.IntegerField()
    current_occupancy = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    rate_per_hour_2w = models.DecimalField(
        decimal_places=2,
        max_digits=5,
        default=10,
    )
    rate_per_hour_4w = models.DecimalField(
        decimal_places=2,
        max_digits=5,
        default=25,
    )

    def __str__(self):
        return f"{self.name} (ID: {self.id})"


class Vehicle(models.Model):
    VEHICLE_TYPES = [
        ('2-wheeler', '2-Wheeler'),
        ('4-wheeler', '4-Wheeler'),
    ]
    plate_number = models.CharField(max_length=50, unique=True)
    vehicle_type = models.CharField(max_length=20, choices=VEHICLE_TYPES, default='2-wheeler')
    is_resident = models.BooleanField(default=False)
    resident = models.ForeignKey(Resident, on_delete=models.CASCADE,blank=True, null=True, related_name='vehicles')
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=10, choices=[('in', 'In'), ('out', 'Out')], default='out')
    parking_lot = models.ForeignKey(ParkingLot, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f"{self.plate_number} (ID: {self.id})"


class ParkingLotRecord(models.Model):
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE)
    parking_lot = models.ForeignKey(ParkingLot, on_delete=models.CASCADE)
    entry_time = models.DateTimeField(auto_now_add=True)
    exit_time = models.DateTimeField(auto_now=True)
    status = models.CharField(max_length=10, choices=[('in', 'In'), ('out', 'Out')])
    parked_time = models.CharField(max_length=100, null=True, blank=True)
    total_fee = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)


User = get_user_model()
class LicensePlateLog(models.Model):
    VEHICLE_TYPES = [
        ('2-wheeler', '2-Wheeler'),
        ('4-wheeler', '4-Wheeler'),
    ]

    plate_number = models.CharField(max_length=50)
    captured_at = models.DateTimeField(auto_now_add=True)
    image_path = models.ImageField(upload_to="AutoPlate_backEnd/data/captured")
    def __str__(self):
        return f"{self.plate_number or 'Unrecognized'} - {self.captured_at}"


