from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.permissions import AllowAny
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from django.conf import settings
from django.conf.urls.static import static


from Auto_Plate.views import (
    RegisterView,
    LoginView,
    SecureAPIView,
    UploadPhotoAPI,
    FinalizeLicensePlateServiceView, VehicleExitAPI, ParkingLotStatusAPI, ParkingLotRecordAPI, CalculateParkingFeeAPI,
    SearchSimilarPlatesAPI, CheckPlatesAPI, LogoutView, RefreshAccessTokenAPI
)

schema_view = get_schema_view(
    openapi.Info(
        title="Parking Lot API",
        default_version='v1',
        description="API for managing parking lots and license plates",
    ),
    public=True,
    permission_classes=[AllowAny],
)

router = DefaultRouter()

urlpatterns = [
    path('api/v1/auth/secure/', SecureAPIView.as_view(), name='secure'),
    path('admin/', admin.site.urls),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('api/v1/auth/register/', RegisterView.as_view(), name='register'),
    path('api/v1/auth/login/', LoginView.as_view(), name='login'),
    path('api/v1/auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/v1/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/v1/parking-lot/status/', ParkingLotStatusAPI.as_view(), name='parking-lot-status'),

    path('api/v1/service/upload/', UploadPhotoAPI.as_view(), name='upload-photo'),
    path('api/v1/service/finalize/', FinalizeLicensePlateServiceView.as_view(), name='finalize-license-plate'),

    path('api/v1/service/exit/', VehicleExitAPI.as_view(), name='exit-vehicle'),

    path('api/v1/parking-lot/records/', ParkingLotRecordAPI.as_view(), name='parking-lot-records'),

    path('api/v1/service/search-similar/', SearchSimilarPlatesAPI.as_view(), name='search-similar-plates'),
    path('api/v1/service/search-plates/', CheckPlatesAPI.as_view(), name='search-resident-plates'),

    path('api/v1/service/calculate-fee/', CalculateParkingFeeAPI.as_view(), name='calculate-parking-fee'),
    path('api/v1/', include(router.urls)),

    path('api/v1/auth/logout',LogoutView.as_view(),name='logout'),
    path('api/v1/auth/refresh-token',RefreshAccessTokenAPI.as_view(),name='refresh-token'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)