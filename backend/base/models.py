from django.db import models

# Create your models here.
from django.db import models


class Profile(models.Model):
    class Gender(models.TextChoices):
        MALE = "male", "Male"
        FEMALE = "female", "Female"
        OTHER = "other", "Other"

    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        INACTIVE = "inactive", "Inactive"
        PENDING = "pending", "Pending"
        
    profile_image = models.ImageField(upload_to="profiles/", null=True, blank=True)
    full_name = models.CharField(max_length=150)
    age = models.PositiveIntegerField()
    email = models.EmailField(unique=True)
    contact_number = models.CharField(max_length=20)
    gender = models.CharField(
        max_length=10,
        choices=Gender.choices,
    )
    address = models.TextField()
    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.ACTIVE,
    )