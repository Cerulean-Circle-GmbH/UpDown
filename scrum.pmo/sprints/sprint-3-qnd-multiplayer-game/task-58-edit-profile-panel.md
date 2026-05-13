[Back to Sprint 3 Planning](./planning.md)

# Task 58: Edit Profile Button + User Profile Panel

## Status
- [x] Planned
- [ ] In Progress
- [ ] QA Review
- [ ] Done

## Requirement (Tron)
Add an edit profile button on the RIGHT side of the name field. Opens a user panel for editing:

1. **Name** — editable text field
2. **Phone number** — editable field
3. **URLs** — editable field(s) for personal links
4. **Profile picture** — two options:
   - Upload a custom image
   - Choose a game card as profile picture (e.g. pick A♠ or K♥)

## Implementation
1. Small edit icon (✏️ or ⚙️) next to the name input in lobby
2. Opens a modal/panel overlay with profile fields
3. Profile data stored in localStorage for persistence
4. Profile picture displayed in player list and chat
5. Card-as-avatar: render a mini playing card as the profile pic

## Acceptance Criteria
- [ ] Edit button visible next to name field in lobby
- [ ] Clicking opens profile editing panel
- [ ] Name field editable and persisted
- [ ] Phone number field
- [ ] URL field(s)
- [ ] Profile picture upload (file input)
- [ ] Alternative: choose a game card as avatar
- [ ] Profile data persisted in localStorage
- [ ] Profile picture shown in player list
- [ ] Panel closeable (X button or click outside)
- [ ] Rebuilt with esbuild
