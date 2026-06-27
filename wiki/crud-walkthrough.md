# CRUD Walkthrough — Restaurants, Dishes & Orders

Demonstrates creating, editing, and deleting restaurants, dishes, and orders on both the **web client** and the **mobile app**.

> All write operations require being logged in. Restaurant/dish management requires an **owner** account (`isOwner: true`).

---

## Restaurants

### Create a restaurant (Web)

1. Log in with an owner account.
2. Click **My Restaurant** in the navbar.
3. Fill in name, description, cuisine, address, phone, and coordinates.
4. Click **Create**. The new restaurant appears in the list on the home page.

<!-- SCREENSHOT: web admin page — create restaurant form -->
<!-- SCREENSHOT: web home page showing the new restaurant card -->

### Create a restaurant (Mobile)

1. Log in with an owner account.
2. Open the drawer → tap **Admin**.
3. Tap **+ New Restaurant**, fill in the form, tap **Save**.

<!-- SCREENSHOT: mobile admin restaurants screen -->
<!-- SCREENSHOT: mobile create restaurant form -->

### Edit a restaurant (Web)

1. On the admin page, click the **Edit** button next to a restaurant.
2. Update the desired fields and click **Save**.

<!-- SCREENSHOT: web edit restaurant form with changed fields -->

### Edit a restaurant (Mobile)

1. In the admin screen, tap a restaurant → tap **Edit**.
2. Update fields and tap **Save**.

<!-- SCREENSHOT: mobile edit restaurant screen -->

### Delete a restaurant (Web)

1. On the admin page, click **Delete** next to a restaurant.
2. A confirmation dialog appears. Confirm to delete.
3. The restaurant is removed from the list immediately.

<!-- SCREENSHOT: web delete confirmation dialog -->

### Delete a restaurant (Mobile)

1. Tap a restaurant in the admin screen → tap **Delete**.
2. Confirm in the dialog.

<!-- SCREENSHOT: mobile delete confirmation -->

---

## Dishes (Products)

### Create a dish (Web)

1. On the admin page, select a restaurant and open its menu section.
2. Fill in dish name, description, category, and price. Click **Add Dish**.

<!-- SCREENSHOT: web add dish form -->
<!-- SCREENSHOT: restaurant page showing the new dish -->

### Create a dish (Mobile)

1. Admin → tap a restaurant → tap **+ New Dish**.
2. Fill in the form and tap **Save**.

<!-- SCREENSHOT: mobile add dish screen -->

### Edit a dish (Web)

1. Click **Edit** on any dish in the admin panel. Update and save.

<!-- SCREENSHOT: web edit dish form -->

### Edit a dish (Mobile)

1. Tap a dish → tap **Edit**, update and save.

<!-- SCREENSHOT: mobile edit dish screen -->

### Delete a dish

Same flow as restaurants — click/tap **Delete**, confirm in the dialog.

<!-- SCREENSHOT: web/mobile delete dish confirmation -->

---

## Orders

### Place an order (Web)

1. Open a restaurant, add items to the cart using **+** on each dish.
2. The cart sidebar shows on the right. Adjust quantities if needed.
3. Click **Checkout**.
4. Enter card number, expiry (MM/YY), and CVV. Click **Place Order**.
5. On success the cart clears and you are redirected to **My Orders**.

<!-- SCREENSHOT: web restaurant page with items in cart sidebar -->
<!-- SCREENSHOT: web checkout page with payment form -->
<!-- SCREENSHOT: web orders page showing the new order with status "pending" -->

### Place an order (Mobile)

1. Open a restaurant, tap **+** on a dish to add it to the cart.
2. Tap the cart icon. Review items and tap **Checkout**.
3. Enter payment details and tap **Place Order**.

<!-- SCREENSHOT: mobile restaurant screen with add buttons -->
<!-- SCREENSHOT: mobile cart screen -->
<!-- SCREENSHOT: mobile checkout screen -->
<!-- SCREENSHOT: mobile orders screen with new order -->

### Cancel an order

Orders can be cancelled within **5 minutes** of placing them.

**Web:** On My Orders, click **Cancel** next to an order (only visible within 5 minutes).  
**Mobile:** On the orders screen, tap the order → tap **Cancel**.

<!-- SCREENSHOT: web orders page with cancel button visible -->
<!-- SCREENSHOT: mobile cancel order option -->

### Admin: view and manage all orders (Web)

1. Log in as owner → My Restaurant → **Orders** tab.
2. All orders for your restaurant are listed with status and items.
3. You can update the status of any order.

<!-- SCREENSHOT: web admin orders list -->

### Admin: view and manage all orders (Mobile)

1. Drawer → Admin → **Orders**.
2. Tap an order to view details or change its status.

<!-- SCREENSHOT: mobile admin orders screen -->