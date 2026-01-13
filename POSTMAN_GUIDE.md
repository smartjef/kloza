# Kloza API - Complete CRUD Guide

## Quick Start

1. **Import Collection**: Open Postman → Import → Select `Kloza-API.postman_collection.json`
2. **Start Server**: `npm run dev`
3. **Test**: Run requests in order or use the "Complete Workflow" folder

## All Endpoints

### Ideas (Full CRUD)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ideas` | Create new idea |
| GET | `/api/ideas` | List all ideas (paginated) |
| GET | `/api/ideas/:id` | Get idea by ID |
| **PATCH** | `/api/ideas/:id` | **Update idea (partial)** |
| **DELETE** | `/api/ideas/:id` | **Delete idea** |

### Kollabs (Full CRUD)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/kollabs` | Create kollab from approved idea |
| GET | `/api/kollabs/:id` | Get kollab by ID |
| **PATCH** | `/api/kollabs/:id` | **Update kollab (status, goal, etc)** |
| **DELETE** | `/api/kollabs/:id` | **Delete kollab** |
| POST | `/api/kollabs/:id/discussions` | Add discussion to kollab |

## Common Update Operations

### Update Idea Status
```json
PATCH /api/ideas/:id
{
  "status": "approved"  // or "draft", "archived"
}
```

### Update Kollab Status
```json
PATCH /api/kollabs/:id
{
  "status": "completed"  // or "active", "cancelled"
}
```

### Add Participants to Kollab
```json
PATCH /api/kollabs/:id
{
  "participants": ["John", "Jane", "Bob", "Alice"]
}
```

## Complete Workflow Example

The collection includes a "Complete Workflow" folder that demonstrates:
1. Create draft idea
2. Approve idea (PATCH status)
3. Create kollab
4. Add discussion
5. Complete kollab (PATCH status)

**Run this folder** using Postman's Collection Runner to see the full lifecycle!

## Business Rules

### Ideas
- Can update any field (title, description, status, createdBy)
- Cannot delete if has active kollab
- Status options: `draft`, `approved`, `archived`

### Kollabs
- Can update goal, participants, successCriteria, status
- Cannot delete active kollabs (must complete/cancel first)
- Only one active kollab per idea
- Status options: `active`, `completed`, `cancelled`

## Update Examples

### Partial Update (PATCH)
Only send fields you want to change:
```json
PATCH /api/ideas/:id
{
  "description": "Updated description only"
}
```

### Status Transitions
**Idea**: draft → approved → archived  
**Kollab**: active → completed/cancelled

## 🔧 Tips

1. **Auto-save IDs**: Collection automatically saves `ideaId`, `kollabId`, `discussionId`
2. **Workflows**: Use the "Complete Workflow" folder to test end-to-end
3. **Partial Updates**: PATCH allows updating individual fields
4. **Status Management**: Use PATCH to change idea/kollab status
5. **Validation**: All updates respect the same validation rules as creation

## Error Handling

- `400` - Validation error (invalid data)
- `403` - Forbidden (e.g., idea not approved)
- `404` - Resource not found
- `409` - Conflict (e.g., deleting idea with active kollab)
- `422` - Unprocessable (e.g., whitespace-only content)

## New Features

- **PATCH endpoints** for partial updates
- **DELETE endpoints** with business rule enforcement
- **Complete workflow** examples
- **Status management** for ideas and kollabs
- **Participant management** for kollabs
