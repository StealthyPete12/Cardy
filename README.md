# Cardy

A phone app that keeps all your store loyalty cards in one place, so you never have to dig through your wallet at the till again.

## Project Description

**Cardy is a digital wallet for loyalty and shopping cards.** These are the plastic cards that shops give you to collect points or get member discounts. With Cardy, you add each card to your phone once. At checkout, you open the app, tap the card, and show the barcode to the cashier.

**There are two ways to add a card.** You can point your phone's camera at the barcode on the physical card and Cardy reads it for you. Or you can type the details in yourself and pick a colour for the card.

**Your cards are shown as a stack, like cards in a real wallet.** You scroll through them with your finger and tap one to open it full-screen with its barcode. You swipe down to close it again. You can also remove cards you no longer need.

**Each person has their own private account.** You sign up with an email and password. Your cards are saved on a server (a computer that stores data and answers requests from the app), so they are tied to your account, not just to one phone.

![Architecture diagram](assets/architecture.svg)

**How to read this diagram**

1. **Mobile App (React Native + Expo):** this is the app on your phone. It shows the screens, reads barcodes with the camera, and keeps your login pass safely on the device.
2. **HTTP / REST arrow:** the app talks to the server over the internet, sending simple requests like "give me my cards" or "save this new card".
3. **REST API (.NET 10 + EF Core):** this is the server program that receives those requests. It acts as the go-between for the app and the stored data.
4. **AuthController:** the part of the server that handles signing up and logging in.
5. **CardController:** the part of the server that fetches, adds and deletes cards.
6. **JWT + BCrypt:** the security layer. It scrambles passwords before storing them and hands out a digital "pass" after you log in.
7. **EF Core arrow:** the server uses a translation tool to read from and write to the database without hand-writing database commands.
8. **Database (SQLite) with Users and Cards:** the filing cabinet where everything is stored. One drawer holds user accounts and the other holds the cards, and each card is linked to its owner.

## Why This Project Exists

**The problem:** many shoppers carry a stack of loyalty cards from grocery stores, clothing shops and pharmacies. The cards are bulky, easy to lose, and often left at home on the day you need them. That means missed points and missed discounts.

**An example:** picture someone doing their weekly shop. At the till they're asked "Do you have our rewards card?" They search through their wallet, can't find it, and either hold up the queue or give up on the points.

**How Cardy helps:** with Cardy, every card lives on the phone they already have in their hand. They open the app, tap the store's card, and the cashier scans the barcode off the screen. No plastic, no searching, no lost points.

## Thought Process & Approach

The steps below follow the order a user goes through the app, from opening it for the first time to showing a card at the till.

### Step 1: Creating an account and logging in
- **What it does:** you sign up or log in with your email and a password. The app then lets you into your wallet.
- **Why we did it this way:** an account means your cards belong to *you* and are stored safely on the server. Passwords are scrambled with **BCrypt** (a one-way scrambling method) before being saved. Even we can't read them.
- **What we considered instead:** storing cards only on the phone, with no account at all. That's simpler, but your cards would be lost if you changed or lost your phone.
- **Trade-off:** we gained privacy between users and a path to using several devices. We gave up simplicity, because the app now needs a running server.

### Step 2: Staying logged in securely
- **What it does:** after you log in, the server gives the app a digital pass called a **JWT** (JSON Web Token, a signed note that proves who you are). The app shows this pass with every request, so you don't have to type your password each time.
- **Why we did it this way:** the pass is kept in **Expo SecureStore**, the phone's built-in locked storage area. It expires after 7 days. When you open the app, it checks whether the pass has expired and asks you to log in again if it has.
- **What we considered instead:** keeping a login session on the server. That works well for websites, but a self-contained pass is a common, simpler fit for mobile apps.
- **Trade-off:** we gained a smooth "stay logged in" experience. We gave up the ability to instantly cancel a pass before it expires, for example if a phone is stolen.

### Step 3: Adding a card (scan or type)
- **What it does:** you choose "Scan Barcode" or "Enter Manually". Scanning reads the barcode with your camera and then asks for the store name. Manual entry asks for the store name, an optional card number, an optional logo link and a theme colour.
- **Why we did it this way:** scanning is fastest and avoids typos. Manual entry is a backup for when the camera isn't allowed or the card is damaged. If you deny camera access, the app offers manual entry instead.
- **What we considered instead:** offering only one of the two options. Scan-only would leave users stuck when scanning fails. Manual-only would be slow and error-prone.
- **Trade-off:** we gained flexibility for the user. We gave up some simplicity in the screen flow, and manually added cards currently get a randomly generated barcode (see Limitations).

### Step 4: Saving cards on the server
- **What it does:** the app sends each new card to the server, which saves it in the database under your account. When you open your wallet, the app asks the server for *only your* cards.
- **Why we did it this way:** we use a **REST API** (a standard, predictable way for apps and servers to exchange data) built with **ASP.NET Core**. The data lives in **SQLite**, a database that is just a single file, so there's nothing extra to install or run.
- **What we considered instead:** a larger database such as PostgreSQL or a hosted cloud database. These are more powerful but need more setup than a personal project requires.
- **Trade-off:** we gained a very simple setup. We gave up the ability to serve many users at once or to run across several servers.

### Step 5: Showing your wallet as a card stack
- **What it does:** your cards appear as an overlapping, colourful stack. You drag to scroll through them and tap one to bring it forward.
- **Why we did it this way:** we wanted it to feel like flicking through a real wallet, not like reading a list. We used **React Native Reanimated** and **Gesture Handler** (tools for smooth animations and touch gestures) to get spring-like, natural movement.
- **What we considered instead:** a plain scrolling list, which is quicker to build but feels flat and less familiar.
- **Trade-off:** we gained a polished, enjoyable experience. We gave up some simplicity, because animation code is harder to build and maintain.

### Step 6: Showing the barcode at checkout
- **What it does:** tapping a card opens it full-screen, with a large barcode and the number written underneath. You swipe down, tap "Done" or tap outside the card to close it. You can delete the card from here too, after a confirmation prompt.
- **Why we did it this way:** the barcode is drawn using a special **barcode font** (a typeface where each character is drawn as barcode lines). That's lightweight and needs no extra image-generation tools.
- **What we considered instead:** a dedicated barcode-drawing library that supports many barcode types. It's more flexible, but it's an extra dependency.
- **Trade-off:** we gained simplicity and speed. We gave up support for other barcode styles, because every card is currently drawn in one format (see Limitations).

## Tech Stack

### Mobile app

| Tool / Technology | What it is (plain English) | Why we used it |
|---|---|---|
| **React Native** | A toolkit for building phone apps for both iPhone and Android from one set of code | We only had to write the app once to run on both platforms |
| **Expo** | A set of ready-made tools that sits on top of React Native and makes building and testing apps easier | Gave us the camera, secure storage and fonts without complex setup |
| **Expo Camera** | The part of Expo that lets the app use the phone's camera | Used to scan barcodes on physical cards |
| **Expo SecureStore** | A locked storage area on the phone for sensitive information | Keeps the login pass safe on the device |
| **React Navigation** | A tool that manages moving between screens in the app | Handles switching between login, wallet and scanning screens |
| **React Native Reanimated & Gesture Handler** | Tools for smooth animations and finger gestures like swipes and drags | Powers the wallet-style card stack and swipe-to-close |

### Server

| Tool / Technology | What it is (plain English) | Why we used it |
|---|---|---|
| **ASP.NET Core (.NET 10)** | Microsoft's framework (a ready-made foundation) for building server programs | Runs the REST API that the app talks to |
| **Entity Framework Core** | A translator between the server's code and the database | Lets us save and load data without writing raw database commands |
| **SQLite** | A small database stored in a single file, like a compact digital filing cabinet | Simple, needs no separate database server |
| **JWT (JSON Web Token)** | A signed digital pass that proves who you are | Keeps users logged in securely between requests |
| **BCrypt** | A method for scrambling passwords so they can't be read back | Protects users' passwords if the database is ever exposed |

## Future Improvements

### Short term
- **Store the real barcode for manually added cards.** Let users type the actual barcode number. *Benefit:* manually added cards would scan at the till.
- **Draw barcodes in their original style.** Use a barcode library that supports EAN-13, UPC, QR and others. *Benefit:* more stores' scanners would accept the barcode on screen.
- **Edit existing cards.** Add an "edit" option for the name, number, colour and logo. *Benefit:* no more deleting and re-adding cards to fix mistakes.
- **Keep a copy of cards on the phone.** Save cards on the device so they load without a connection. *Benefit:* your cards work even with no signal in the shop.

### Long term
- **Host the server online.** Move the API and database to a cloud service and use a larger database such as PostgreSQL. *Benefit:* anyone could download and use Cardy, on any network.
- **Add to Apple Wallet.** The server already includes a tool for creating Apple Wallet passes, but it isn't used yet (TODO: confirm this is the plan). *Benefit:* cards could appear in the phone's built-in wallet and on the lock screen.
- **Automatic store logos.** Look up a store's logo from its name. *Benefit:* cards look polished without users hunting for logo links.
- **Account features.** Add password reset, changing your email and the option to delete your account. *Benefit:* users stay in control of their accounts.
- **Stronger security.** Require a proper secret key, switch on the full checks for login passes, and add a way to log out of all devices. *Benefit:* the app is safe enough for real users and their data.
