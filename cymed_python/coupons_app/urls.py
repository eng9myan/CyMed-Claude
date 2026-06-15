from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CouponViewSet, UserCouponViewSet

router = DefaultRouter()
router.register(r'coupons', CouponViewSet)
router.register(r'usercoupons', UserCouponViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
