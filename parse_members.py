import re
import os
import json

json_path = r"E:\dkffj\parsed_members.json"
output_path = r"E:\dkffj\dkffj-next\src\lib\teamData.ts"
public_uploads_dir = r"E:\dkffj\dkffj-next\public\uploads\membership_form"

if not os.path.exists(json_path):
    print(f"Error: {json_path} not found!")
    exit(1)

with open(json_path, 'r', encoding='utf-8') as f:
    raw_members = json.load(f)

rows = []

for m in raw_members:
    row_id = str(m.get('id', '')).strip()
    id_no = str(m.get('id_no', '')).strip()
    enroll_me = str(m.get('enroll_me', '')).strip()
    frstname = str(m.get('frstname', '')).strip()
    surname = str(m.get('surname', '')).strip()
    education = str(m.get('education', '')).strip()
    qualification = str(m.get('qualification', '')).strip()
    distric2 = str(m.get('distric2', '')).strip()
    state2 = str(m.get('state2', '')).strip()
    mobile = str(m.get('mobile', '')).strip()
    user_photo = str(m.get('user_photo', '')).strip()
    designation = str(m.get('designation', '')).strip()
    
    # Status
    status_val = m.get('status', 1)
    try:
        status = int(status_val)
    except:
        status = 1

    # Show home
    show_home_val = m.get('show_home', 0)
    try:
        show_home = int(show_home_val)
    except:
        show_home = 0

    # Name cleaning
    full_name = f"{frstname}".strip()
    full_name_clean = re.sub(r'(?i)^(hold\s+id\s+|id\s+hold\s+)', '', full_name).strip()
    if not full_name_clean or full_name_clean.lower() in ["hold id", "id hold", "test"]:
        continue

    # Designation / Role fallback
    role = designation if (designation and designation.lower() != "nil") else enroll_me
    role = role.replace("'", "").strip()
    if not role or role.lower() in ["other", "nil", ""]:
        role = "Member"

    # Qualification / Education fallback
    edu = qualification if (qualification and qualification.lower() != "nil") else education
    edu = edu.replace("'", "").strip()
    if not edu or edu.lower() in ["hi", "nil", ""]:
        edu = "Not Specified"

    # Location
    loc_state = state2 if state2 else "India"
    loc_state = loc_state.replace("'", "").strip()
    loc_district = distric2.replace("'", "").strip() if distric2 else ""
    location = f"{loc_district}, {loc_state}" if loc_district else loc_state

    # Photo URL mapping
    photo_file = user_photo.replace("'", "").strip()
    if id_no == "1000":
        photo_url = "/members/danish.jpg"
    elif id_no == "1004":
        photo_url = "/members/wasim.jpg"
    elif id_no == "1010":
        photo_url = "/members/vipin.jpg"
    elif id_no == "1012":
        photo_url = "/members/tiwari.jpg"
    elif photo_file:
        full_photo_path = os.path.join(public_uploads_dir, photo_file)
        if os.path.exists(full_photo_path):
            photo_url = f"/uploads/membership_form/{photo_file}"
        else:
            photo_url = ""
    else:
        photo_url = ""

    rows.append({
        "id": id_no if id_no else row_id,
        "name": full_name_clean,
        "role": role,
        "education": edu,
        "location": location,
        "mobile": mobile.replace("'", "").strip(),
        "photo": photo_url,
        "status": status,
        "show_home": show_home
    })

# Save to teamData.ts
os.makedirs(os.path.dirname(output_path), exist_ok=True)
with open(output_path, 'w', encoding='utf-8') as out:
    out.write("export interface TeamMember {\n")
    out.write("  id: string;\n")
    out.write("  name: string;\n")
    out.write("  role: string;\n")
    out.write("  education: string;\n")
    out.write("  location: string;\n")
    out.write("  mobile: string;\n")
    out.write("  photo: string;\n")
    out.write("  status: number;\n")
    out.write("  showHome: number;\n")
    out.write("}\n\n")
    out.write("export const teamMembers: TeamMember[] = [\n")
    
    # Sort members: those with photo first, then status = 1, then name
    sorted_rows = sorted(rows, key=lambda x: (
        0 if x["photo"] != "" else 1, 
        0 if x["status"] == 1 else 1,
        x["name"]
    ))
    
    for row in sorted_rows:
        # Escape quotes in strings safely
        clean_name = row['name'].replace('"', '\\"')
        clean_role = row['role'].replace('"', '\\"')
        clean_edu = row['education'].replace('"', '\\"')
        clean_loc = row['location'].replace('"', '\\"')
        
        out.write("  {\n")
        out.write(f"    id: \"{row['id']}\",\n")
        out.write(f"    name: \"{clean_name}\",\n")
        out.write(f"    role: \"{clean_role}\",\n")
        out.write(f"    education: \"{clean_edu}\",\n")
        out.write(f"    location: \"{clean_loc}\",\n")
        out.write(f"    mobile: \"{row['mobile']}\",\n")
        out.write(f"    photo: \"{row['photo']}\",\n")
        out.write(f"    status: {row['status']},\n")
        out.write(f"    showHome: {row['show_home']}\n")
        out.write("  },\n")
    out.write("];\n")

print(f"Successfully generated teamData.ts with {len(sorted_rows)} members!")
