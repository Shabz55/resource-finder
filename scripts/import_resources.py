#!/usr/bin/env python3
import json
import re
import sys
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET

NS = {
    "m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main",
    "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
}

DEFAULT_WORKBOOK = "/Users/shahbazqureshi/Downloads/(My Copy) List of Help-Seeking Resources.xlsx"
DEFAULT_OUTPUT = "public/resources.json"

REGION_BY_SHEET = {
    "National Resources": "National",
    "National FR CA Resources": "National - French",
    "YK Resources": "Yukon",
    "NWT Resources": "Northwest Territories",
    "NVT Resources": "Nunavut",
    "BC Resources": "British Columbia",
    "AB Resources": "Alberta",
    "SK Resources": "Saskatchewan",
    "MB Resources": "Manitoba",
    "ON Resources": "Ontario",
    "Quebec English Resources": "Quebec",
    "Atlantic CA Resources": "Atlantic Canada",
}

REGION_ALIASES = {
    "national": {"national"},
    "alberta": {"alberta", "ab"},
    "british-columbia": {"british columbia", "bc"},
    "saskatchewan": {"saskatchewan", "sk"},
    "manitoba": {"manitoba", "mb"},
    "ontario": {"ontario", "on"},
    "quebec": {"quebec", "qc"},
    "atlantic-canada": {"atlantic canada", "nova scotia", "new brunswick", "newfoundland", "pei", "prince edward island", "ns", "nb", "nl"},
    "yukon": {"yukon", "yk"},
    "northwest-territories": {"northwest territories", "nwt"},
    "nunavut": {"nunavut"},
    "north": {"yukon", "northwest territories", "nunavut", "yk", "nwt"},
}

TAG_RULES = {
    "crisis": ["crisis", "suicide", "distress", "urgent", "helpline", "emergency"],
    "peer-support": ["peer", "warmline", "support group", "community"],
    "counselling": ["counselling", "counseling", "therapy", "therapist", "clinical", "mental health"],
    "directory": ["directory", "resource hub", "service directory", "navigation"],
    "education": ["education", "educational", "information", "knowledge", "learn"],
    "self-guided": ["app", "self-guided", "worksheet", "course", "toolkit", "online resource"],
    "phone": ["call:", "phone", "telephone", "helpline", "1-800", "811", "988"],
    "text-chat": ["text", "chat", "sms"],
    "virtual": ["virtual", "online", "website", "app", "computer"],
    "in-person": ["in-person", "in person", "walk in", "walk-in", "service centres", "clinic"],
    "free": ["no cost", "free"],
    "low-cost": ["low cost", "low-cost", "sliding scale", "pay what you can", "pwyc", "affordable"],
    "youth": ["youth", "young people", "young adults", "children", "teen", "student", "12-24", "18-35", "under 20"],
    "child": ["child", "children", "under 12", "0-12", "4-18"],
    "young-adult": ["young adult", "young adults", "18-25", "18-35"],
    "student": ["student", "post-secondary", "campus", "university", "college"],
    "adult": ["adult", "adults", "18+"],
    "indigenous": ["indigenous", "first nations", "inuit", "métis", "metis"],
    "black": ["black youth", "black community", "black communities", "black"],
    "caribbean": ["caribbean"],
    "east-asian": ["east asian", "chinese", "korean", "japanese", "taiwanese"],
    "latino": ["latino", "latina", "latinx", "latin american", "hispanic"],
    "middle-eastern": ["middle eastern", "arab", "persian", "west asian", "afghan", "egyptian", "iranian"],
    "south-asian": ["south asian", "east indian", "pakistani", "sri lankan", "indo-caribbean", "punjabi", "hindi", "urdu", "malayalam"],
    "southeast-asian": ["southeast asian", "filipino", "vietnamese", "cambodian", "thai"],
    "white": ["white", "european descent"],
    "muslim": ["muslim", "islamic", "spiritually-sensitive", "spiritually sensitive"],
    "racialized": ["bipoc", "qtbipoc", "poc", "racialized", "visible minority", "ethnocultural"],
    "lgbtq": ["lgbtq", "lgbtq2", "2slgbtq", "queer", "trans"],
    "newcomer": ["newcomer", "immigrant", "refugee"],
    "family-caregiver": ["caregiver", "caregivers", "family support", "families", "parents"],
    "mens-mental-health": ["men's mental health", "mens mental health", "men and boys", "heads up guys"],
    "trauma": ["trauma", "ptsd", "post-traumatic"],
    "french": ["french", "français", "francophone"],
    "english": ["english"],
    "addictions": ["addiction", "substance use"],
    "sexual-violence": ["sexual assault", "sexual violence"],
    "eating-disorders": ["eating disorder"],
}


def cell_text(cell, shared_strings):
    value = cell.find("m:v", NS)
    if value is None:
        inline = cell.find("m:is/m:t", NS)
        return (inline.text or "").strip() if inline is not None else ""

    raw = value.text or ""
    if cell.attrib.get("t") == "s" and raw.isdigit():
        return shared_strings[int(raw)].strip()
    return raw.strip()


def column_index(cell_ref):
    letters = re.match(r"[A-Z]+", cell_ref).group(0)
    total = 0
    for char in letters:
        total = total * 26 + ord(char) - 64
    return total - 1


def load_shared_strings(workbook):
    if "xl/sharedStrings.xml" not in workbook.namelist():
        return []

    root = ET.fromstring(workbook.read("xl/sharedStrings.xml"))
    strings = []
    for item in root.findall("m:si", NS):
        strings.append("".join(text.text or "" for text in item.findall(".//m:t", NS)))
    return strings


def workbook_sheets(workbook):
    book = ET.fromstring(workbook.read("xl/workbook.xml"))
    rels = ET.fromstring(workbook.read("xl/_rels/workbook.xml.rels"))
    targets = {rel.attrib["Id"]: rel.attrib["Target"] for rel in rels}

    for sheet in book.findall(".//m:sheet", NS):
        name = sheet.attrib["name"]
        rel_id = sheet.attrib[f"{{{NS['r']}}}id"]
        target = targets[rel_id]
        yield name, f"xl/{target}" if not target.startswith("/") else target[1:]


def rows_for_sheet(workbook, path, shared_strings):
    sheet = ET.fromstring(workbook.read(path))
    rows = []
    for row in sheet.findall(".//m:sheetData/m:row", NS):
        values = {}
        for cell in row.findall("m:c", NS):
            text = cell_text(cell, shared_strings)
            if text:
                values[column_index(cell.attrib["r"])] = text
        if values:
            rows.append(values)
    return rows


def normalize_header(header):
    value = re.sub(r"\s+", " ", header.strip().lower())
    if value == "link":
        return "website"
    if value == "phone number":
        return "contact information"
    if value == "service type":
        return "service"
    if value == "description ":
        return "description"
    if value == "cost? (if known)":
        return "cost"
    if value == "language + hours of operation":
        return "language_hours"
    return value


def field(record, *keys):
    for key in keys:
        value = record.get(key, "").strip()
        if value:
            return value
    return ""


def slug(value):
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")


def contains_alias(text, alias):
    escaped = re.escape(alias)
    return re.search(rf"(?<![a-z0-9]){escaped}(?![a-z0-9])", text) is not None


def split_focus(value):
    pieces = re.split(r"\s*(?:\+|,|;|/|\band\b)\s*", value)
    return [piece.strip() for piece in pieces if piece.strip()]


def infer_tags(record, region):
    haystack = " ".join(
        [
            record.get("name", ""),
            record.get("service", ""),
            record.get("focus", ""),
            record.get("mode", ""),
            record.get("cost", ""),
            record.get("age", ""),
            record.get("language_hours", ""),
            record.get("description", ""),
            record.get("service area", ""),
            record.get("notes", ""),
        ]
    ).lower()

    tags = set()
    for tag, needles in TAG_RULES.items():
        if any(needle in haystack for needle in needles):
            tags.add(tag)

    has_all_age_language = "all ages" in haystack or "any age" in haystack
    has_bounded_youth_range = re.search(
        r"\b(?:under\s+\d{1,2}|\d{1,2}\s*(?:-|to)\s*(?:1[0-8]))\b",
        haystack,
    )
    if has_all_age_language and not has_bounded_youth_range:
        tags.add("adult")

    contact_text = record.get("contact information", "")
    if re.search(r"(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?){2}\d{4}", contact_text):
        tags.add("phone")

    region_text = f"{region} {record.get('service area', '')}".lower()
    for tag, aliases in REGION_ALIASES.items():
        if any(contains_alias(region_text, alias) for alias in aliases):
            tags.add(tag)

    if region != "National":
        tags.add("regional")

    return sorted(tags)


def normalize_resource(sheet_name, row_number, headers, row):
    record = {}
    for index, header in enumerate(headers):
        if header:
            record[normalize_header(header)] = row.get(index, "").strip()

    name = field(record, "name")
    if not name or name.lower() in {"name", "***see below"}:
        return None

    region = REGION_BY_SHEET.get(sheet_name, sheet_name)
    service = field(record, "service")
    focus = field(record, "focus")
    contact = field(record, "contact information")
    website = field(record, "website")
    description = field(record, "description")

    if not any([service, focus, contact, website, description]):
        return None

    return {
        "id": slug(f"{sheet_name}-{row_number}-{name}"),
        "name": name,
        "region": region,
        "service": service,
        "focus": split_focus(focus),
        "focusText": focus,
        "mode": field(record, "mode"),
        "cost": field(record, "cost"),
        "age": field(record, "age"),
        "languageHours": field(record, "language_hours"),
        "description": description,
        "contact": contact,
        "serviceArea": field(record, "service area"),
        "website": website,
        "notes": field(record, "notes"),
        "sourceSheet": sheet_name,
        "tags": infer_tags(record, region),
    }


def extract_resources(workbook_path):
    resources = []
    with zipfile.ZipFile(workbook_path) as workbook:
        shared_strings = load_shared_strings(workbook)
        for sheet_name, sheet_path in workbook_sheets(workbook):
            if sheet_name not in REGION_BY_SHEET:
                continue

            rows = rows_for_sheet(workbook, sheet_path, shared_strings)
            header_index = next(
                (index for index, row in enumerate(rows) if any(value.lower() == "name" for value in row.values())),
                None,
            )
            if header_index is None:
                continue

            header_row = rows[header_index]
            headers = [header_row.get(index, "") for index in range(max(header_row) + 1)]
            for row_number, row in enumerate(rows[header_index + 1 :], start=header_index + 2):
                resource = normalize_resource(sheet_name, row_number, headers, row)
                if resource:
                    resources.append(resource)

    return resources


def main():
    workbook_path = Path(sys.argv[1] if len(sys.argv) > 1 else DEFAULT_WORKBOOK)
    output_path = Path(sys.argv[2] if len(sys.argv) > 2 else DEFAULT_OUTPUT)

    if not workbook_path.exists():
        raise SystemExit(f"Workbook not found: {workbook_path}")

    resources = extract_resources(workbook_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(
        json.dumps(
            {
                "source": str(workbook_path),
                "generatedAt": "",
                "resourceCount": len(resources),
                "resources": resources,
            },
            ensure_ascii=False,
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )
    print(f"Wrote {len(resources)} resources to {output_path}")


if __name__ == "__main__":
    main()
