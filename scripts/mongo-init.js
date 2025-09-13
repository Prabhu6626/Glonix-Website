// MongoDB initialization script
const db = db.getSiblingDB("glonix_electronics")

// Create collections with validation
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["email", "hashed_password", "full_name", "created_at"],
      properties: {
        email: {
          bsonType: "string",
          pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$",
        },
        hashed_password: { bsonType: "string" },
        full_name: { bsonType: "string" },
        company: { bsonType: ["string", "null"] },
        phone: { bsonType: ["string", "null"] },
        role: { bsonType: "string", enum: ["user", "admin"] },
        is_active: { bsonType: "bool" },
        created_at: { bsonType: "date" },
        updated_at: { bsonType: "date" },
      },
    },
  },
})

db.createCollection("projects", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["user_id", "title", "description", "service_type", "created_at"],
      properties: {
        user_id: { bsonType: "string" },
        title: { bsonType: "string" },
        description: { bsonType: "string" },
        service_type: {
          bsonType: "string",
          enum: ["pcb-fabrication", "pcb-assembly", "component-sourcing", "design-development"],
        },
        status: {
          bsonType: "string",
          enum: ["pending", "in-progress", "completed", "cancelled"],
        },
        estimated_value: { bsonType: ["number", "null"] },
        deadline: { bsonType: ["date", "null"] },
        created_at: { bsonType: "date" },
        updated_at: { bsonType: "date" },
      },
    },
  },
})

print("✅ MongoDB collections created with validation rules")
