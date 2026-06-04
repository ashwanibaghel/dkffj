import re
import os

input_path = r"C:\Users\ashwa\.gemini\antigravity\brain\35e9745f-4d5d-4f35-8493-86a8e7f51280\scratch\extracted_data.txt"
output_path = r"E:\dkffj\dkffj-next\src\lib\teamData.ts"

# Read the file
with open(input_path, 'r', encoding='utf-8', errors='ignore') as f:
    content = f.read()

# Locate the membership_form table section
start_idx = content.find("=== TABLE: membership_form ===")
if start_idx == -1:
    print("Table membership_form not found!")
    exit(1)

# Find the next table or end of file
end_idx = content.find("===", start_idx + 30)
if end_idx == -1:
    table_content = content[start_idx:]
else:
    table_content = content[start_idx:end_idx]

# Columns description line:
# Columns: `id`, `id_no`, `enroll_me`, `working_area`, `state`, `zone`, `distric`, `tehsil`, `frstname`, `fathername`, `surname`, `dob_date`, `dob_month`, `dob_year`, `gender`, `profession`, `education`, `address`, `landmark`, `postoffice`, `tehsil2`, `distric2`, `state2`, `pincode`, `mobile`, `whatsapp_no`, `email`, `polic_station`, `aadahr_card`, `user_photo`, `user_signature`, `addeddate`, `newDate`, `status`, `show_home`, `designation`, `qualification`
# Parsing rows
rows = []
lines = table_content.split('\n')
for line in lines:
    if line.startswith("Row "):
        # Format: Row X: 9, '1000', ...
        # Let's extract values. A row is a sequence of SQL fields.
        # Let's use a regex or string splitter that respects single quotes and handles escapes.
        # First, strip the "Row X: " prefix
        line_data = line.split(":", 1)[1].strip()
        
        # Simple parser for SQL insert row values
        fields = []
        in_quote = False
        current_field = []
        escaped = False
        
        i = 0
        while i < len(line_data):
            char = line_data[i]
            if escaped:
                current_field.append(char)
                escaped = False
            elif char == '\\':
                escaped = True
            elif char == "'":
                in_quote = not in_quote
            elif char == "," and not in_quote:
                fields.append("".join(current_field).strip())
                current_field = []
            else:
                current_field.append(char)
            i += 1
        fields.append("".join(current_field).strip())
        
        # We need mapping based on columns index:
        # 0: id
        # 1: id_no
        # 2: enroll_me (designation/role)
        # 3: working_area
        # 4: state (code)
        # 5: zone
        # 6: distric
        # 7: tehsil
        # 8: frstname
        # 9: fathername
        # 10: surname
        # 11: dob_date
        # 12: dob_month
        # 13: dob_year
        # 14: gender
        # 15: profession
        # 16: education
        # 17: address
        # 21: distric2
        # 22: state2 (state name)
        # 24: mobile
        # 25: whatsapp_no
        # 26: email
        # 29: user_photo
        # 33: status (0/1)
        # 34: show_home (0/1)
        # 35: designation
        # 36: qualification
        
        if len(fields) >= 35:
            row_id = fields[0]
            id_no = fields[1]
            enroll_me = fields[2]
            frstname = fields[8]
            surname = fields[10]
            education = fields[16]
            distric2 = fields[21] if len(fields) > 21 else ""
            state2 = fields[22] if len(fields) > 22 else ""
            mobile = fields[24] if len(fields) > 24 else ""
            user_photo = fields[29] if len(fields) > 29 else ""
            
            # Extract status (should be integer 1 or 0)
            status_val = fields[33] if len(fields) > 33 else "1"
            # Try to convert to int
            status = 1
            try:
                status = int(status_val)
            except:
                status = 1
                
            show_home_val = fields[34] if len(fields) > 34 else "0"
            show_home = 0
            try:
                show_home = int(show_home_val)
            except:
                show_home = 0

            designation = fields[35] if len(fields) > 35 else ""
            qualification = fields[36] if len(fields) > 36 else ""
            
            # Clean up fields
            # Check for dummy name values
            full_name = f"{frstname}".strip()
            # If name starts with "Hold id" or "Id hold", remove it
            full_name_clean = re.sub(r'(?i)^(hold\s+id\s+|id\s+hold\s+)', '', full_name)
            # Remove "Hi" or similar dummy initials from name
            if full_name_clean.lower() == "hold id":
                continue
                
            # Fallback for designation
            role = designation if designation else enroll_me
            role = role.replace("'", "").strip()
            if not role or role.lower() == "member" or role.lower() == "other":
                continue
                
            edu = qualification if qualification else education
            edu = edu.replace("'", "").strip()
            if not edu or edu.lower() == "hi" or edu.lower() == "nil":
                edu = "Not Specified"
                
            loc_state = state2 if state2 else "India"
            loc_state = loc_state.replace("'", "").strip()
            
            loc_district = distric2.replace("'", "").strip() if distric2 else ""
            location = f"{loc_district}, {loc_state}" if loc_district else loc_state
            
            photo_url = user_photo.replace("'", "").strip()
            
            # Map specific core leadership photos to our clean cropped ones
            if id_no == "1000":
                photo_url = "/members/danish.jpg"
            elif id_no == "1004":
                photo_url = "/members/wasim.jpg"
            elif id_no == "1010":
                photo_url = "/members/vipin.jpg"
            elif id_no == "1012":
                photo_url = "/members/tiwari.jpg"
            else:
                photo_url = "" # Let Next.js render a placeholder initials circle
                
            rows.append({
                "id": id_no,
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
    out.write("  show_home: number;\n")
    out.write("}\n\n")
    out.write("export const teamMembers: TeamMember[] = [\n")
    
    # Sort members: active leadership first (those with custom photos), then status = 1, then rest
    sorted_rows = sorted(rows, key=lambda x: (
        0 if x["photo"] != "" else 1, 
        0 if x["status"] == 1 else 1,
        x["name"]
    ))
    
    for row in sorted_rows:
        out.write("  {\n")
        out.write(f"    id: \"{row['id']}\",\n")
        out.write(f"    name: \"{row['name']}\",\n")
        out.write(f"    role: \"{row['role']}\",\n")
        out.write(f"    education: \"{row['education']}\",\n")
        out.write(f"    location: \"{row['location']}\",\n")
        out.write(f"    mobile: \"{row['mobile']}\",\n")
        out.write(f"    photo: \"{row['photo']}\",\n")
        out.write(f"    status: {row['status']},\n")
        out.write(f"    show_home: {row['show_home']}\n")
        out.write("  },\n")
    out.write("];\n")

print(f"Successfully generated teamData.ts with {len(sorted_rows)} members!")
