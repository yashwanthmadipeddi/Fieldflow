from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenRefreshView

from .serializers import LoginSerializer, RegisterSerializer, UserSerializer

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data, status=status.HTTP_200_OK)

class MeView(APIView):
    def get(self, request):
        return Response(UserSerializer(request.user).data)

class RefreshView(TokenRefreshView):
    permission_classes = [permissions.AllowAny]


class WorkersView(APIView):
    def get(self, request):
        from .models import User
        if request.user.role != User.Role.OWNER:
            return Response({"detail": "Only owners can view workers."}, status=403)
        workers = User.objects.filter(role=User.Role.WORKER, is_active=True).order_by("first_name", "last_name", "username")
        return Response(UserSerializer(workers, many=True).data)
