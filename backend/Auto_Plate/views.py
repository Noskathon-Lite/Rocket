from decimal import Decimal

from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework import status
from django.conf import settings
import os,re

from rest_framework_simplejwt.exceptions import TokenError

from Auto_Plate.models import Vehicle, ParkingLotRecord, ParkingLot, Resident
from django.contrib.auth import get_user_model
from .serializers import RegisterSerializer, ParkingLotRecordSerializer, ResidentSerializer

from django.contrib.auth import authenticate
from rest_framework.permissions import AllowAny,IsAuthenticated
from .recognition_service import detect_and_recognize_license_plate
from django.utils.timezone import now


from rest_framework_simplejwt.tokens import RefreshToken
print(RefreshToken.__module__)


User = get_user_model()




#Login n Register endpoints view
class SecureAPIView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [JSONParser]

    def get(self, request):
        user = request.user
        return Response({
            'message': 'You are authenticated!',
            'full_name': user.full_name
        })


@method_decorator(csrf_exempt, name='dispatch')
class RegisterView(APIView):
    permission_classes = [AllowAny]
    parser_classes = [JSONParser]

    def post(self, request, *args, **kwargs):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                "message": "User registered successfully",
                "user": {
                    "id": user.id,
                    "full_name": user.full_name,
                    "email": user.email,
                    "role": user.role
                }
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    permission_classes = [AllowAny]
    parser_classes = [JSONParser]


    def post(self, request, *args, **kwargs):
        from rest_framework.serializers import Serializer, CharField

        class LoginSerializer(Serializer):
            email = CharField(max_length=255)
            password = CharField(max_length=128, write_only=True)

        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            password = serializer.validated_data['password']

            # Authenticate the user
            user = authenticate(request, username=email, password=password)
            if user:
                if user:
                    if user.is_active:
                        # Generate JWT tokens
                        refresh = RefreshToken.for_user(user)
                        return Response({
                            "message": "Login successful",
                            "full_name" : user.full_name,
                            "access_token": str(refresh.access_token),
                            "refresh_token": str(refresh),
                            "role": user.role
                        }, status=status.HTTP_200_OK)
                    else:
                        return Response({"error": "Account is deactivated"}, status=status.HTTP_403_FORBIDDEN)
                else:
                    return Response({"error": "Invalid email or password"}, status=status.HTTP_401_UNAUTHORIZED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


                            ############## Upload Photo #############

class RefreshAccessTokenAPI(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        refresh_token = request.data.get("refresh_token")

        if not refresh_token:
            return Response({"error": "Refresh token is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Add your code that may raise exceptions here
            # Create a new access token using the provided refresh token
            token = RefreshToken(refresh_token)
            new_access_token = str(token.access_token)

            return Response({
                "access_token": new_access_token,
                "message": "Access token refreshed successfully"
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": "Invalid or expired refresh token"}, status=status.HTTP_400_BAD_REQUEST)

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [JSONParser]

    def post(self, request):
        refresh_token = request.data.get('refresh_token')
        if not refresh_token:
            return Response({"error": "Refresh token is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"message": "Logout successful"}, status=status.HTTP_200_OK)
        except TokenError as e:
            return Response({"error": "Invalid token"}, status=status.HTTP_400_BAD_REQUEST)

class ParkingLotStatusAPI(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [JSONParser]

    def get(self, request, *args, **kwargs):
        parking_lots = ParkingLot.objects.all()
        data = [
            {
                "parking_lot_id": lot.id,
                "name": lot.name,
                "location": lot.location,
                "total": lot.capacity,
                "occupied": lot.current_occupancy,
                "remaining": lot.capacity - lot.current_occupancy,
                "rate_per_hour_2w": lot.rate_per_hour_2w,
                "rate_per_hour_4w": lot.rate_per_hour_4w,
                "status": "Full" if lot.current_occupancy >= lot.capacity else "Available",
            }
            for lot in parking_lots
        ]
        return Response(data, status=200)

#### upload image ####
from .utils import find_similar_plates


@method_decorator(csrf_exempt, name='dispatch')
class UploadPhotoAPI(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request):
        image = request.data.get('image')

        if not image:
            return Response({"error": "Image is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Save the image temporarily
            temp_image_path = os.path.join(settings.MEDIA_ROOT, 'temp_image.jpg')
            with open(temp_image_path, 'wb') as temp_file:
                for chunk in image.chunks():
                    temp_file.write(chunk)

            # Detect the license plate
            detected_plate = detect_and_recognize_license_plate(temp_image_path)
            print(detected_plate)
            if not detected_plate:
                return Response({"error": "No license plate detected or extracted"}, status=status.HTTP_404_NOT_FOUND)

            if isinstance(detected_plate, list):
                detected_plate = " ".join(detected_plate)
                detected_plate = re.sub(r'[^A-Za-z0-9]', '', detected_plate).upper()

            return Response({
                "message": "License plate detected successfully",
                "detected_plate": detected_plate
            }, status=status.HTTP_200_OK)
        finally:
            if os.path.exists(temp_image_path):
                os.remove(temp_image_path)





################ finalize ###################


@method_decorator(csrf_exempt, name='dispatch')
class FinalizeLicensePlateServiceView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [JSONParser]

    def post(self, request):
        finalized_plate_number = request.data.get('finalized_plate_number')
        vehicle_type = request.data.get('vehicle_type')
        parking_lot_id = request.data.get('parking_lot_id')

        # Ensure all inputs are present
        if not finalized_plate_number or not vehicle_type or not parking_lot_id:
            return Response(
                {"error": "Finalized plate number, and parking lot ID are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            finalized_plate_number = finalized_plate_number.upper().strip()

            parking_lot = ParkingLot.objects.get(id=parking_lot_id)

            if parking_lot.current_occupancy >= parking_lot.capacity:
                return Response(
                    {"error": "Parking lot is full. Cannot finalize this vehicle."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Only create non-resident vehicles if they don't exist
            vehicle, created = Vehicle.objects.get_or_create(
                plate_number=finalized_plate_number,
                defaults={
                    'vehicle_type': vehicle_type,
                    'status': 'in',
                    'parking_lot': parking_lot,
                }
            )

            updates = []
            if not created:  # If vehicle already exists, update fields as needed
                if vehicle.status == 'in':
                    return Response(
                        {"error": "Vehicle is already marked as 'in' and cannot be finalized again."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                if vehicle.parking_lot != parking_lot:
                    vehicle.parking_lot = parking_lot
                    updates.append(f"Parking lot updated to {parking_lot.name}")

                if vehicle.status != 'in':
                    vehicle.status = 'in'
                    updates.append("Vehicle status updated to 'in'")

                if not vehicle.is_resident and vehicle.vehicle_type != vehicle_type:
                    vehicle.vehicle_type = vehicle_type
                    updates.append(f"Vehicle type updated to {vehicle_type}")

                vehicle.save()

            # Update parking lot occupancy
            parking_lot.current_occupancy += 1
            parking_lot.save()

            # Create a new ParkingLotRecord
            parking_record = ParkingLotRecord.objects.create(
                vehicle=vehicle,
                parking_lot=parking_lot,
                status='in'
            )

            # Prepare the response
            response_data = {
                "message": "License plate finalized successfully and parking lot updated",
                "vehicle_id": vehicle.id,
                "parking_record_id": parking_record.id,
                "updates": updates,
            }

            return Response(response_data, status=status.HTTP_200_OK)

        except ParkingLot.DoesNotExist:
            return Response({"error": "Parking lot not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)






@method_decorator(csrf_exempt, name='dispatch')
class VehicleExitAPI(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [JSONParser]

    def post(self, request):
        plate_number = request.data.get('plate_number')

        if not plate_number:
            return Response(
                {"error": "Plate number is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            vehicle = Vehicle.objects.get(plate_number=plate_number)

            if vehicle.status != 'in':
                return Response(
                    {"error": "Vehicle is not currently in the parking lot"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            parking_record = ParkingLotRecord.objects.get(vehicle=vehicle, status='in')
            entry_time = parking_record.entry_time
            exit_time = now()
            time_diff = exit_time - entry_time

            parked_time_days = time_diff.days
            parked_time_hours, remainder = divmod(time_diff.seconds, 3600)
            parked_time_minutes = remainder // 60
            formatted_parked_time = f"{parked_time_days} day(s), {parked_time_hours} hour(s), {parked_time_minutes} minute(s)"

            parking_lot = parking_record.parking_lot
            rate_per_hour = (
                parking_lot.rate_per_hour_2w if vehicle.vehicle_type == '2-wheeler'
                else parking_lot.rate_per_hour_4w
            )

            if vehicle.is_resident:
                parking_record.exit_time = exit_time
                parking_record.parked_time = formatted_parked_time
                parking_record.total_fee = Decimal(0)
                parking_record.status = 'out'
                parking_record.save()

                vehicle.status = 'out'
                vehicle.save()

                parking_lot.current_occupancy -= 1
                parking_lot.save()

                return Response({
                    "plate_number": vehicle.plate_number,
                    "is_resident": vehicle.is_resident,
                    "vehicle_type": vehicle.vehicle_type,
                    "entry_time": entry_time,
                    "exit_time": exit_time,
                    "total_time_parked": formatted_parked_time,
                    "parking_lot_name": parking_lot.name,
                }, status=status.HTTP_200_OK)

            total_hours = time_diff.total_seconds() / 3600
            total_fee = round(Decimal(total_hours) * rate_per_hour, 2)

            parking_record.exit_time = exit_time
            parking_record.parked_time = formatted_parked_time
            parking_record.total_fee = total_fee
            parking_record.status = 'out'
            parking_record.save()

            vehicle.status = 'out'
            vehicle.save()
            parking_lot.current_occupancy -= 1
            parking_lot.save()

            return Response({
                "plate_number": vehicle.plate_number,
                "is_resident": vehicle.is_resident,
                "vehicle_type": vehicle.vehicle_type,
                "entry_time": entry_time,
                "exit_time": exit_time,
                "total_time_parked": formatted_parked_time,
                "total_fee": total_fee,
                "rate_per_hour": rate_per_hour,
                "parking_lot_name": parking_lot.name,
            }, status=status.HTTP_200_OK)

        except Vehicle.DoesNotExist:
            return Response({"error": "Vehicle not found"}, status=status.HTTP_404_NOT_FOUND)
        except ParkingLotRecord.DoesNotExist:
            return Response({"error": "No active parking record found for this vehicle"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)




class ParkingLotRecordAPI(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [JSONParser]

    def get(self, request, *args, **kwargs):
        records = ParkingLotRecord.objects.select_related('vehicle').all()
        serializer = ParkingLotRecordSerializer(records, many=True)
        return Response(serializer.data, status=200)


class CalculateParkingFeeAPI(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [JSONParser]

    def post(self, request):
        plate_number = request.data.get('plate_number')

        if not plate_number:
            return Response(
                {"error": "Plate number is required"},
                status=400
            )

        try:
            vehicle = Vehicle.objects.get(plate_number=plate_number)

            if vehicle.status != 'in':
                return Response(
                    {"error": "Vehicle is not currently in the parking lot"},
                    status=400
                )

            parking_record = ParkingLotRecord.objects.get(vehicle=vehicle, status='in')
            entry_time = parking_record.entry_time
            current_time = now()
            parked_time_seconds = (current_time - entry_time).total_seconds()
            parked_time_hours = round(parked_time_seconds / 3600, 2)

            parking_lot = parking_record.parking_lot
            rate_per_hour = (
                parking_lot.rate_per_hour_2w if vehicle.vehicle_type == '2-wheeler'
                else parking_lot.rate_per_hour_4w
            )

            if vehicle.is_resident:
                return Response({
                    "plate_number": vehicle.plate_number,
                    "entry_time": entry_time,
                    "current_time": current_time,
                    "parking_lot_name" : parking_lot.name,
                    "total_time_parked": f"{int(parked_time_hours)} hour(s) {int((parked_time_hours % 1) * 60)} minute(s)",
                }, status=200)

            total_fee = round(Decimal(parked_time_hours) * rate_per_hour, 2)

            return Response({
                "plate_number": vehicle.plate_number,
                "entry_time": entry_time,
                "current_time": current_time,
                "total_time_parked": f"{int(parked_time_hours)} hour(s) {int((parked_time_hours % 1) * 60)} minute(s)",
                "calculated_fee": total_fee,
                "rate_per_hour": rate_per_hour,
                "parking_lot_name": parking_lot.name
            }, status=200)

        except Vehicle.DoesNotExist:
            return Response({"error": "Vehicle not found"}, status=404)
        except ParkingLotRecord.DoesNotExist:
            return Response({"error": "No active parking record found for this vehicle"}, status=404)
        except Exception as e:
            return Response({"error": str(e)}, status=500)


class SearchSimilarPlatesAPI(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [JSONParser]

    def post(self, request):
        print("Request Data:", request.data)
        detected_plate = request.data.get('plate_number')
        print("Detected Plate:", detected_plate)

        if not detected_plate:
            return Response({"error": "Plate number is required"}, status=status.HTTP_400_BAD_REQUEST)

        all_vehicles = Vehicle.objects.all()
        all_plates = [vehicle.plate_number for vehicle in all_vehicles]

        # Use a more reasonable threshold (adjust as needed)
        similar_plates = find_similar_plates(detected_plate, all_plates, threshold=5)
        print("Similar Plates:", similar_plates)

        if not similar_plates:
            return Response(
                {"detected_plate": detected_plate, "similar_vehicles": [], "message": "No similar plates found"},
                status=status.HTTP_200_OK,
            )

        results = []
        for entry in similar_plates:
            plate = entry["plate"]
            try:
                vehicle = Vehicle.objects.get(plate_number=plate)
                parking_record = ParkingLotRecord.objects.filter(vehicle=vehicle).order_by('-entry_time').first()

                # Access resident details if available
                resident = vehicle.resident if vehicle.is_resident else None
                resident_data = ResidentSerializer(resident).data if resident else None

                result = {
                    "plate_number": vehicle.plate_number,
                    "vehicle_type": vehicle.vehicle_type,
                    "is_resident": vehicle.is_resident,
                    "status": vehicle.status,
                    "last_entry": parking_record.entry_time if parking_record else None,
                    "last_exit": parking_record.exit_time if parking_record else None,
                    "resident_info": resident_data,
                }
                results.append(result)
            except Vehicle.DoesNotExist:
                continue

        return Response({"detected_plate": detected_plate, "similar_vehicles": results}, status=status.HTTP_200_OK)


class CheckPlatesAPI(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [JSONParser]

    def post(self, request):
        plate_number = request.data.get("plate_number")
        if not plate_number:
            return Response({"error": "Plate number is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            vehicle = Vehicle.objects.get(plate_number=plate_number)
            return Response({
                "plate_number": vehicle.plate_number,
                "is_resident": vehicle.is_resident,
                "vehicle_type": vehicle.vehicle_type,
                "status": vehicle.status
            }, status=status.HTTP_200_OK)

        except Vehicle.DoesNotExist:
            return Response({"error": "Vehicle not found"}, status=status.HTTP_404_NOT_FOUND)
