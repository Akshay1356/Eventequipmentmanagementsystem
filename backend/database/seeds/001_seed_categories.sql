-- ==============================================================================
-- AURA Event Equipment Management System — Starter Seeds
-- Seeds only the authoritative equipment categories required by the system.
-- ==============================================================================

USE event_equipment_db;

INSERT INTO categories (category_id, name, slug, description)
VALUES
  ('audio', 'Audio Equipment', 'audio', 'Professional live touring sound reinforcement, active line arrays, subwoofers, digital mixing consoles, and wireless microphone systems.'),
  ('lighting', 'Lighting Equipment', 'lighting', 'Intelligent moving-head spot, beam, and wash luminaires, wireless LED pixel tubes, hazers, and DMX control consoles.'),
  ('projection', 'Projection & Displays', 'projection', 'High-definition modular LED video wall tiles, ultra-high lumen 3LCD laser projectors, and media servers.'),
  ('stage', 'Stage & Trussing', 'stage', 'TUV-certified aluminum box trussing spans, ground-supported goalposts, heavy-duty modular stage decks, and motorized hoists.'),
  ('furniture', 'Furniture & Decor', 'furniture', 'VIP lounge modular sectionals, illuminated highboy standing tables, podiums, and designer hospitality decor.'),
  ('dj', 'DJ Equipment', 'dj', 'Industry standard festival tour riders including multi-channel digital mixers, high-resolution media players, and analog rotary consoles.'),
  ('accessories', 'Event Accessories', 'accessories', '3-phase Camlock power distribution units, multi-pair balanced audio stage snakes, cable ramps, and rigging hardware.')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description);
