from rest_framework import viewsets
from rest_framework.permissions import DjangoModelPermissions, IsAuthenticated
from .models import Coupon, UserCoupon
from .serializers import CouponSerializer, UserCouponSerializer

class CouponViewSet(viewsets.ModelViewSet):
    queryset = Coupon.objects.all()
    serializer_class = CouponSerializer
    permission_classes = [IsAuthenticated, DjangoModelPermissions]

class UserCouponViewSet(viewsets.ModelViewSet):
    queryset = UserCoupon.objects.all()
    serializer_class = UserCouponSerializer
    permission_classes = [IsAuthenticated, DjangoModelPermissions]

