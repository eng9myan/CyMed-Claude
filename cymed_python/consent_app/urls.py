from rest_framework.routers import DefaultRouter
from .views import ConsentGrantViewSet, BreakGlassViewSet, AuthorizedRepresentativeViewSet, ConsentAccessLogViewSet

router = DefaultRouter()
router.register("grants",           ConsentGrantViewSet,             basename="consent-grant")
router.register("break-glass",      BreakGlassViewSet,               basename="break-glass")
router.register("representatives",  AuthorizedRepresentativeViewSet, basename="representative")
router.register("audit-log",        ConsentAccessLogViewSet,         basename="consent-audit-log")

urlpatterns = router.urls
