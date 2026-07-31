import os
import json
import urllib.request
import ssl

os.environ.pop("HTTP_PROXY", None)
os.environ.pop("http_proxy", None)
os.environ.pop("HTTPS_PROXY", None)
os.environ.pop("https_proxy", None)

url = "https://tgszzjbvpcznndrfkkov.supabase.co/rest/v1/memberships?select=*&order=id.desc"
headers = {
    "apikey": "sb_publishable_TU0EoaL-jusAaWLETkH5Ig_ODLvIw5n",
    "Authorization": "Bearer sb_publishable_TU0EoaL-jusAaWLETkH5Ig_ODLvIw5n"
}

proxy_handler = urllib.request.ProxyHandler({})
opener = urllib.request.build_opener(proxy_handler)

req = urllib.request.Request(url, headers=headers)
try:
    with opener.open(req) as response:
        data = json.loads(response.read().decode())
        print(f"Total members returned from REST API: {len(data)}")
        
        remarks_count = {}
        for m in data:
            rem = m.get("remarks") or "NO_REMARKS"
            remarks_count[rem] = remarks_count.get(rem, 0) + 1
        print("Remarks count:", json.dumps(remarks_count, indent=2))
        
        names = {}
        for m in data:
            nm = (m.get("full_name") or "").strip().lower()
            if nm:
                if nm not in names:
                    names[nm] = []
                names[nm].append(m)
        
        dup_names = {k: v for k, v in names.items() if len(v) > 1}
        print(f"\nTotal duplicate full_name entries: {len(dup_names)}")
        for nm, list_m in list(dup_names.items())[:10]:
            print(f"\n--- Name Duplicate: {nm} (Count: {len(list_m)}) ---")
            for m in list_m:
                print(f"  - ID: {m.get('id')} | Ack: {m.get('ack_no')} | Mobile: {m.get('mobile')} | Address: {m.get('permanent_address')} | Remarks: {m.get('remarks')}")

        mobiles = {}
        for m in data:
            mob = (m.get("mobile") or "").strip()
            if mob:
                if mob not in mobiles:
                    mobiles[mob] = []
                mobiles[mob].append(m)
        dup_mobiles = {k: v for k, v in mobiles.items() if len(v) > 1}
        print(f"\nTotal duplicate mobile entries: {len(dup_mobiles)}")
        for mob, list_m in list(dup_mobiles.items())[:10]:
            print(f"\n--- Mobile Duplicate: {mob} (Count: {len(list_m)}) ---")
            for m in list_m:
                print(f"  - ID: {m.get('id')} | Ack: {m.get('ack_no')} | Name: {m.get('full_name')} | Address: {m.get('permanent_address')} | Remarks: {m.get('remarks')}")

except Exception as e:
    print("Error:", e)
