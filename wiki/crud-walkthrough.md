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

![Web create restaurant form](web-restaurant-create.png)
![Web home page with the new restaurant](web-home-new-restaurant.png)

### Create a restaurant (Mobile)

1. Log in with an owner account.
2. Open **Profile** → tap **Manage restaurants**.
3. Tap **Add restaurant**, fill in the form, tap **Save**.

![Mobile admin restaurants screen](mobile-admin-restaurants.png)
![Mobile new restaurant form](mobile-restaurant-create.png)

### Edit a restaurant (Web)

1. On the admin page, click the **Edit** button next to a restaurant.
2. Update the desired fields and click **Save**.

![Web edit restaurant form](web-restaurant-edit.png)

### Edit a restaurant (Mobile)

1. In the admin screen, tap a restaurant → tap **Edit**.
2. Update fields and tap **Save**.

![Mobile edit restaurant screen](mobile-restaurant-edit.png)

### Delete a restaurant (Web)

1. On the admin page, click **Delete** next to a restaurant.
2. A confirmation dialog appears. Confirm to delete.
3. The restaurant is removed from the list immediately.

### Delete a restaurant (Mobile)

1. In the admin screen, tap **Delete** next to a restaurant.
2. Confirm in the dialog.

![Mobile delete restaurant confirmation](mobile-restaurant-delete.png)

---

## Dishes (Products)

### Create a dish (Web)

1. On the admin page, select a restaurant and open its menu section.
2. Fill in dish name, description, category, and price. Click **Add Dish**.

![Web add dish form](web-dish-create.png)
![Web restaurant page with the new dish](web-restaurant-dish.png)

### Create a dish (Mobile)

1. Profile → Manage restaurants → tap **Dishes** on a restaurant → tap **Add dish**.
2. Fill in the form and tap **Save**.

![Mobile new dish form](mobile-dish-create.png)

### Edit a dish (Web)

1. Click **Edit** on any dish in the admin panel. Update and save.

![Web edit dish form](web-dish-edit.png)

### Edit a dish (Mobile)

1. Tap a dish → tap **Edit**, update and save.

![Mobile edit dish screen](mobile-dish-edit.png)

### Delete a dish

Same flow as restaurants — click/tap **Delete**, confirm in the dialog.

![Mobile delete dish confirmation](mobile-dish-delete.png)

---

## Orders

### Place an order (Web)

1. Open a restaurant, add items to the cart using **+** on each dish.
2. The cart sidebar shows on the right. Adjust quantities if needed.
3. Click **Checkout**.
4. Enter card number, expiry (MM/YY), and CVV. Click **Place Order**.
5. On success the cart clears and you are redirected to **My Orders**.

![Web restaurant page with cart sidebar](web-cart-sidebar.png)
![Web checkout page with payment form](web-checkout.png)
![Web orders page with a pending order](web-orders.png)

### Place an order (Mobile)

1. Open a restaurant, tap **Add** on a dish to add it to the cart.
2. Tap **Cart** in the header. Review items and tap **Go to checkout**.
3. Enter payment details and tap **Pay**.

![Mobile restaurant menu with Add buttons](mobile-restaurant-menu.png)
![Mobile cart screen](mobile-cart.png)
![Mobile checkout screen](mobile-checkout.png)
![Mobile orders screen with new order](mobile-orders.png)

### Cancel an order

Orders can be cancelled within **5 minutes** of placing them.

**Web:** On My Orders, click **Cancel** next to an order (only visible within 5 minutes).  
**Mobile:** On the orders screen, tap the order → tap **Cancel**.

![Web orders page with the cancel button](web-orders-cancel.png)
![Mobile orders with the cancel option](mobile-cancel-order.png)

### Admin: view and manage all orders (Web)

1. Log in as owner → My Restaurant → **Orders** tab.
2. All orders for your restaurant are listed with status and items.
3. You can update the status of any order.

### Admin: view and manage all orders (Mobile)

1. Profile → Manage restaurants → tap **Orders** on a restaurant.
2. Tap an order to view details or change its status.

![Mobile admin orders with status controls](mobile-admin-orders.png)