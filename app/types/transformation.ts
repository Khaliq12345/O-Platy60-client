// types/transformation.ts
export interface Transformation {
  id: string
  purchase_id: string
  product_name: string
  quantity_received: number
  quantity_usable: number
  waste_quantity: number
  transformation_date: string
  notes?: string
  cook_signature?: string
  manager_signature?: string
  created_by: string
  created_at: string
  updated_at: string
}

// Étend Transformation avec les champs summary
export interface TransformationSummary extends Transformation {
  total_portions: number
  total_step_quantity: number
  step_count: number
  remaining_quantity: number
}

export interface TransformationStep {
  id: string
  transformation_id: string
  step_name: string
  portions: number
  quantity: number
  created_at: string
}