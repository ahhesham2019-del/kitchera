المرحلة الأولى - إعداد المشروع في Unreal Engine 5

1. إنشاء مشروع جديد
- افتح Unreal Engine 5.
- اختر "Games" ثم "Blank" أو "Third Person" كقاعدة، مع تمكين C++.
- سم المشروع مثلاً: "MilSimProject".
- حدد "No Starter Content" أو "Starter Content" حسب الحاجة.

2. شجرة المجلدات المقترحة في Content
- Content/Gameplay/Characters
- Content/Gameplay/Weapons
- Content/Gameplay/Vehicles
- Content/Gameplay/AI
- Content/Maps
- Content/UI
- Content/Effects
- Content/Audio

3. فئات C++ الأساسية
- GameMode: إدارة قواعد اللعبة، فئة اللاعب، فئة الشخصية.
- Character: حركة المشاة، القفز، الانحناء، وضعيات الرماية.
- PlayerController: إدخال اللاعب، الكاميرا، الأوامر.

4. خطة التنفيذ الأولى
- أنشئ فئة GameMode مخصصة.
- أنشئ فئة Character موروثة من ACharacter.
- أنشئ فئة PlayerController موروثة من APlayerController.

أول أكواد C++ لنظام التحكم باللاعب

// MyMilSimGameMode.h
#pragma once

#include "CoreMinimal.h"
#include "GameFramework/GameModeBase.h"
#include "MyMilSimGameMode.generated.h"

UCLASS()
class MILSIMPROJECT_API AMyMilSimGameMode : public AGameModeBase
{
    GENERATED_BODY()

public:
    AMyMilSimGameMode();
};

// MyMilSimGameMode.cpp
#include "MyMilSimGameMode.h"
#include "MyMilSimCharacter.h"
#include "MyMilSimPlayerController.h"

AMyMilSimGameMode::AMyMilSimGameMode()
{
    DefaultPawnClass = AMyMilSimCharacter::StaticClass();
    PlayerControllerClass = AMyMilSimPlayerController::StaticClass();
}

// MyMilSimPlayerController.h
#pragma once

#include "CoreMinimal.h"
#include "GameFramework/PlayerController.h"
#include "MyMilSimPlayerController.generated.h"

UCLASS()
class MILSIMPROJECT_API AMyMilSimPlayerController : public APlayerController
{
    GENERATED_BODY()

protected:
    virtual void SetupInputComponent() override;
};

// MyMilSimPlayerController.cpp
#include "MyMilSimPlayerController.h"
#include "MyMilSimCharacter.h"

void AMyMilSimPlayerController::SetupInputComponent()
{
    Super::SetupInputComponent();

    if (InputComponent)
    {
        InputComponent->BindAxis("MoveForward");
        InputComponent->BindAxis("MoveRight");
        InputComponent->BindAxis("Turn");
        InputComponent->BindAxis("LookUp");
        InputComponent->BindAction("Jump", IE_Pressed, this, &APlayerController::Jump);
    }
}

// MyMilSimCharacter.h
#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Character.h"
#include "MyMilSimCharacter.generated.h"

UCLASS()
class MILSIMPROJECT_API AMyMilSimCharacter : public ACharacter
{
    GENERATED_BODY()

public:
    AMyMilSimCharacter();

protected:
    virtual void SetupPlayerInputComponent(class UInputComponent* PlayerInputComponent) override;

    void MoveForward(float Value);
    void MoveRight(float Value);
    void Turn(float Value);
    void LookUp(float Value);
};

// MyMilSimCharacter.cpp
#include "MyMilSimCharacter.h"

AMyMilSimCharacter::AMyMilSimCharacter()
{
    PrimaryActorTick.bCanEverTick = true;
}

void AMyMilSimCharacter::SetupPlayerInputComponent(UInputComponent* PlayerInputComponent)
{
    Super::SetupPlayerInputComponent(PlayerInputComponent);

    PlayerInputComponent->BindAxis("MoveForward", this, &AMyMilSimCharacter::MoveForward);
    PlayerInputComponent->BindAxis("MoveRight", this, &AMyMilSimCharacter::MoveRight);
    PlayerInputComponent->BindAxis("Turn", this, &AMyMilSimCharacter::Turn);
    PlayerInputComponent->BindAxis("LookUp", this, &AMyMilSimCharacter::LookUp);
    PlayerInputComponent->BindAction("Jump", IE_Pressed, this, &ACharacter::Jump);
}

void AMyMilSimCharacter::MoveForward(float Value)
{
    if (Controller && Value != 0.0f)
    {
        const FRotator Rotation = Controller->GetControlRotation();
        const FRotator YawRotation(0, Rotation.Yaw, 0);
        const FVector Direction = FRotationMatrix(YawRotation).GetUnitAxis(EAxis::X);
        AddMovementInput(Direction, Value);
    }
}

void AMyMilSimCharacter::MoveRight(float Value)
{
    if (Controller && Value != 0.0f)
    {
        const FRotator Rotation = Controller->GetControlRotation();
        const FRotator YawRotation(0, Rotation.Yaw, 0);
        const FVector Direction = FRotationMatrix(YawRotation).GetUnitAxis(EAxis::Y);
        AddMovementInput(Direction, Value);
    }
}

void AMyMilSimCharacter::Turn(float Value)
{
    AddControllerYawInput(Value);
}

void AMyMilSimCharacter::LookUp(float Value)
{
    AddControllerPitchInput(Value);
}

الخطوة التالية بعد تنفيذ المرحلة الأولى:
- تأكيد أن المشروع يشتغل في المحرر.
- تأكيد أن الحركات الأساسية تعمل.
- ثم ننتقل إلى المرحلة الثانية لبناء نظام الحركة والبالستيات ونظام الصحة.