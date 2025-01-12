from rest_framework import serializers
from .models import User, Vehicle, ParkingLot, ParkingLotRecord, LicensePlateLog, Resident


class ParkingLotSerializer(serializers.ModelSerializer):
    class Meta:
        model = ParkingLot
        fields = '__all__'

class VehiclesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vehicle
        fields = '__all__'

class ParkingLotRecordSerializer(serializers.ModelSerializer):
    plate_number = serializers.CharField(source='vehicle.plate_number', read_only=True)
    vehicle_type = serializers.CharField(source='vehicle.vehicle_type', read_only=True)
    is_resident = serializers.BooleanField(source='vehicle.is_resident', read_only=True)
    parking_lot_name = serializers.CharField(source='parking_lot.name', read_only=True)

    class Meta:
        model = ParkingLotRecord
        fields = [
            'id', 'vehicle', 'plate_number', 'parking_lot','parking_lot_name', 'entry_time', 'vehicle_type',
            'exit_time', 'status', 'parked_time', 'total_fee', 'is_resident'
        ]

class VehicleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vehicle
        fields = ['id', 'plate_number', 'vehicle_type', 'status', 'is_resident', 'created_at']

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'full_name', 'email', 'password', 'role', 'created_at']

class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['full_name', 'email', 'password', 'role']
        extra_kwargs = {
            'password': {'write_only': True}
        }


    def create(self, validated_data):
        user = User.objects.create_user(
            full_name=validated_data['full_name'],
            email=validated_data['email'],
            password=validated_data['password'],
        )
        user.role = validated_data.get('role', 'user')
        if user.role == 'admin' and not user.is_superuser:
            user.is_staff = True
        user.save()
        return user



class ResidentSerializer(serializers.ModelSerializer):
    photo = serializers.SerializerMethodField()

    class Meta:
        model = Resident
        fields = ['id', 'full_name', 'phone_number', 'photo']  # Use 'photo', not 'get_photo'

    def get_photo(self, obj):
        if obj.photo:
            return f"..{obj.photo.url}"
        return None
