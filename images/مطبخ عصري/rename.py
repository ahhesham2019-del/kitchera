import os

# المسار المباشر لمجلد مطبخ عصري
folder_path = r"F:\BMW\ورق\kitchera\images\مطبخ عصري"

# الحصول على جميع ملفات الصور
valid_extensions = ('.jpg', '.jpeg', '.png', '.webp')
files = [f for f in os.listdir(folder_path) if f.lower().endswith(valid_extensions)]

# خطوة مؤقتة لتفادي التعارض أثناء إعادة التسمية
for index, filename in enumerate(files, start=1):
    ext = os.path.splitext(filename)[1]
    temp_name = f"temp_{index}{ext}"
    os.rename(os.path.join(folder_path, filename), os.path.join(folder_path, temp_name))

# التسمية النهائية المتسلسلة من 1.jpg حتى 33.jpg
temp_files = [f for f in os.listdir(folder_path) if f.startswith('temp_')]
for index, filename in enumerate(temp_files, start=1):
    old_path = os.path.join(folder_path, filename)
    new_path = os.path.join(folder_path, f"{index}.jpg")
    os.rename(old_path, new_path)

print("تمت إعادة تسمية جميع الصور بنجاح وبدون تكرار!")