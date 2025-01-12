from django import forms
from django.contrib import admin
from django.contrib.auth.models import Permission
from django.contrib.contenttypes.models import ContentType
from django.core.exceptions import ValidationError
from django.urls import reverse
from django.utils.html import format_html, format_html_join, format_html

from .models import User, Vehicle, ParkingLot, ParkingLotRecord, LicensePlateLog, Resident

#Admin Panel confirmed
def assign_permissions(user):
    if user.role == 'admin':
        # Grant all permissions for specific models
        models = [Vehicle, ParkingLot, ParkingLotRecord, LicensePlateLog]
        for model in models:
            content_type = ContentType.objects.get_for_model(model)
            permissions = Permission.objects.filter(content_type=content_type)
            user.user_permissions.add(*permissions)
    user.save()

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('id', 'full_name', 'email', 'role', 'is_resident', 'created_at')
    search_fields = ('full_name', 'email')
    list_filter = ('role',)

    def save_model(self, request, obj, form, change):
        if obj.pk:  # If updating an existing user
            existing_user = User.objects.get(pk=obj.pk)
            if existing_user.password != obj.password:
                # Hash the password if it has changed
                obj.set_password(obj.password)
        else:  # If creating a new user
            obj.set_password(obj.password)
        super().save_model(request, obj, form, change)

    def has_module_permission(self, request):
        return request.user.is_staff

    def has_view_permission(self, request, obj=None):
        return request.user.is_staff


class VehicleAdminForm(forms.ModelForm):
    class Meta:
        model = Vehicle
        fields = '__all__'

    def clean(self):

        ### .clean() lae default validation logic override garxa

        cleaned_data = super().clean()
        status = cleaned_data.get('status')
        parking_lot = cleaned_data.get('parking_lot')
        is_resident = cleaned_data.get('is_resident')
        resident = cleaned_data.get('resident')

        if status == 'in' and not parking_lot:
            self.add_error('parking_lot', "A parking lot must be selected when the vehicle status is 'In'.")

        if is_resident and not resident:
            raise ValidationError("The 'Resident' field is required when 'Is Resident' is checked.")

        if not is_resident:
            cleaned_data['resident'] = None

        return cleaned_data



@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    form = VehicleAdminForm

    def owner_name(self, obj):
        if obj.resident:
            url = reverse('admin:Auto_Plate_resident_change', args=[obj.resident.id])
            return format_html('<a href="{}">{}</a>', url, obj.resident.full_name)
        return "No Owner"
    owner_name.short_description = 'Owner'

    def get_vehicle_type_display(self, obj):
        return obj.get_vehicle_type_display()
    get_vehicle_type_display.short_description = 'Vehicle Type'

    list_display = ('plate_number', 'get_vehicle_type_display', 'is_resident', 'status', 'owner_name')

    def save_model(self, request, obj, form, change):
        if obj.status == 'in' and not obj.parking_lot:
            raise ValidationError("A parking lot must be selected when the vehicle status is 'In'.")
        super().save_model(request, obj, form, change)

    class Media:
        js = ('admin/js/vehicle_status.js',)  # Include custom JS file

    def has_module_permission(self, request):
        return request.user.is_staff

    def has_view_permission(self, request, obj=None):
        return request.user.is_staff

@admin.register(ParkingLot)
class ParkingLotAdmin(admin.ModelAdmin):
    list_display = ('id','name', 'location', 'capacity', 'current_occupancy', 'rate_per_hour_2w', 'rate_per_hour_4w', 'created_at')
    search_fields = ('name', 'location')

    def has_module_permission(self, request):
        return request.user.is_staff

    def has_view_permission(self, request, obj=None):
        return request.user.is_staff

@admin.register(ParkingLotRecord)
class ParkingLotsAdmin(admin.ModelAdmin):
    list_display = ('id', 'vehicle', 'parking_lot', 'entry_time', 'exit_time', 'status', 'parked_time', 'total_fee')
    def has_module_permission(self, request):
        return request.user.is_staff

    def has_view_permission(self, request, obj=None):
        return request.user.is_staff

@admin.register(LicensePlateLog)
class LicensePlateLogAdmin(admin.ModelAdmin):
    list_display = ('plate_number', 'captured_at')
    search_fields = ('plate_number',)

    def has_module_permission(self, request):
        return request.user.is_staff

    def has_view_permission(self, request, obj=None):
        return request.user.is_staff

@admin.register(Resident)
class ResidentAdmin(admin.ModelAdmin):

    def vehicle_count(self, obj):
        """Return the number of vehicles associated with the resident."""
        return obj.vehicles.count()

    vehicle_count.short_description = 'Number of Vehicles'

    def all_vehicles(self, obj):
        """Return a comma-separated list of clickable vehicle plate numbers."""
        vehicles = obj.vehicles.all()
        if not vehicles:
            return "-"
        vehicle_links = format_html_join(
            " , ",
            '<a href="{}">{}</a>',
            ((reverse('admin:Auto_Plate_vehicle_change', args=[vehicle.id]), vehicle.plate_number) for vehicle in vehicles)
        )
        return vehicle_links

    all_vehicles.short_description = 'Vehicles'

    list_display = ('id', 'full_name', 'phone_number', 'vehicle_count', 'all_vehicles')
    search_fields = ('full_name', 'phone_number', 'vehicles__plate_number')