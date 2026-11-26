# Database Schema (Phase 1)

## accounts.User (custom)
id, email (unique), mobile, first_name, last_name, role (owner/manager/cashier/barista/customer), is_active, date_joined, password

## core.BusinessSettings (singleton)
business_name, tagline, address, contact_number, email, opening_hours (JSON), social (JSON), logo_url, matcha_green, currency, timezone, delivery_enabled, reservation_enabled, senior_pwd_discount_enabled, senior_pwd_percent, senior_pwd_food_qty, senior_pwd_drink_qty, loyalty_enabled, loyalty_price_cap, loyalty_expiry_days

## core.AuditLog
id, actor (FK User nullable), action, target_type, target_id, payload (JSON), created_at

## menu.Category
id, name, slug, description, display_order, is_active, created_at, updated_at

## menu.Product
id, category (FK), name, slug, description, base_price, image_url, is_available, is_featured, is_best_seller, is_stamp_eligible, allows_hot_iced, allows_milk, allows_sugar, display_order, created_at, updated_at

## menu.ProductSize
id, product (FK), name, price_adjustment, display_order, is_active

## menu.Addon
id, name, price, is_active, display_order

## menu.ProductAddon (M2M through)
product, addon

## orders.Order
id, order_code (unique), customer_name, customer_mobile, customer_email, order_type (pickup), status, payment_method, payment_status (unpaid/pending_verification/verified/rejected), subtotal, discount_total, total, notes, cancellation_reason, created_at, updated_at, created_by (FK User nullable)

## orders.OrderItem
id, order (FK), product (FK), product_name (snapshot), size (FK nullable), size_name, quantity, unit_price, line_total, hot_iced, milk, sugar, addons (JSON), notes, is_stamp_eligible

## orders.OrderStatusHistory
id, order (FK), from_status, to_status, changed_by (FK User nullable), note, created_at

## payments.PaymentMethodConfig
id, method (gcash/maya/bank/cash), is_enabled, account_name, account_number, instructions, qr_image_url, requires_verification, display_order

## payments.PaymentVerification
id, order (FK one-to-one), reference_number, submitted_at, verified_by (FK User nullable), verified_at, status (pending/approved/rejected), rejection_reason

## Phase 2+ (deferred)
loyalty.LoyaltyAccount, LoyaltyTransaction, Reward; reservations.*; delivery settings already in BusinessSettings.
