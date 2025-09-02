const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Marketplace", function () {
    let marketplace;
    let owner, seller, buyer;
    let itemName = "Premium Study Notes";
    let itemDescription = "Comprehensive notes for blockchain development";
    let itemPrice = ethers.parseEther("0.1"); // 0.1 ETH

    beforeEach(async function () {
        [owner, seller, buyer] = await ethers.getSigners();

        const Marketplace = await ethers.getContractFactory("Marketplace");
        marketplace = await Marketplace.deploy();
        await marketplace.waitForDeployment();
    });

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            expect(await marketplace.owner()).to.equal(owner.address);
        });

        it("Should initialize with zero items", async function () {
            expect(await marketplace.itemCount()).to.equal(0);
        });
    });

    describe("Listing Items", function () {
        it("Should allow users to list items", async function () {
            await expect(marketplace.connect(seller).listItem(itemName, itemDescription, itemPrice))
                .to.emit(marketplace, "ItemListed")
                .withArgs(1, itemName, itemPrice, seller.address);

            const item = await marketplace.getItem(1);
            expect(item.name).to.equal(itemName);
            expect(item.description).to.equal(itemDescription);
            expect(item.price).to.equal(itemPrice);
            expect(item.seller).to.equal(seller.address);
            expect(item.isSold).to.be.false;
        });

        it("Should reject listing with zero price", async function () {
            await expect(
                marketplace.connect(seller).listItem(itemName, itemDescription, 0)
            ).to.be.revertedWith("Price must be greater than 0");
        });

        it("Should reject listing with empty name", async function () {
            await expect(
                marketplace.connect(seller).listItem("", itemDescription, itemPrice)
            ).to.be.revertedWith("Name cannot be empty");
        });

        it("Should reject listing with empty description", async function () {
            await expect(
                marketplace.connect(seller).listItem(itemName, "", itemPrice)
            ).to.be.revertedWith("Description cannot be empty");
        });
    });

    describe("Purchasing Items", function () {
        beforeEach(async function () {
            await marketplace.connect(seller).listItem(itemName, itemDescription, itemPrice);
        });

        it("Should allow users to purchase items", async function () {
            const initialBalance = await ethers.provider.getBalance(seller.address);

            await expect(
                marketplace.connect(buyer).purchaseItem(1, { value: itemPrice })
            ).to.emit(marketplace, "ItemPurchased")
                .withArgs(1, itemName, itemPrice, seller.address, buyer.address);

            const item = await marketplace.getItem(1);
            expect(item.buyer).to.equal(buyer.address);
            expect(item.isSold).to.be.true;

            const finalBalance = await ethers.provider.getBalance(seller.address);
            expect(finalBalance).to.be.greaterThan(initialBalance);
        });

        it("Should reject purchase with insufficient payment", async function () {
            const insufficientPrice = ethers.parseEther("0.05");
            await expect(
                marketplace.connect(buyer).purchaseItem(1, { value: insufficientPrice })
            ).to.be.revertedWith("Insufficient payment");
        });

        it("Should reject purchase by seller", async function () {
            await expect(
                marketplace.connect(seller).purchaseItem(1, { value: itemPrice })
            ).to.be.revertedWith("Seller cannot buy their own item");
        });

        it("Should refund excess payment", async function () {
            const excessPayment = ethers.parseEther("0.2");
            const initialBalance = await ethers.provider.getBalance(buyer.address);

            await marketplace.connect(buyer).purchaseItem(1, { value: excessPayment });

            const finalBalance = await ethers.provider.getBalance(buyer.address);
            const expectedBalance = initialBalance - itemPrice; // Should only pay the item price
            expect(finalBalance).to.be.closeTo(expectedBalance, ethers.parseEther("0.01"));
        });
    });

    describe("View Functions", function () {
        beforeEach(async function () {
            // List multiple items
            await marketplace.connect(seller).listItem("Item 1", "Description 1", ethers.parseEther("0.1"));
            await marketplace.connect(buyer).listItem("Item 2", "Description 2", ethers.parseEther("0.2"));
            await marketplace.connect(seller).listItem("Item 3", "Description 3", ethers.parseEther("0.3"));
        });

        it("Should return all items", async function () {
            const allItems = await marketplace.getAllItems();
            expect(allItems.length).to.equal(3);
        });

        it("Should return only available items", async function () {
            // Purchase one item
            await marketplace.connect(buyer).purchaseItem(1, { value: ethers.parseEther("0.1") });

            const availableItems = await marketplace.getAvailableItems();
            expect(availableItems.length).to.equal(2);
        });

        it("Should return user's listed items", async function () {
            const myItems = await marketplace.connect(seller).getMyListedItems();
            expect(myItems.length).to.equal(2);
        });

        it("Should return user's purchased items", async function () {
            await marketplace.connect(buyer).purchaseItem(1, { value: ethers.parseEther("0.1") });

            const purchasedItems = await marketplace.connect(buyer).getMyPurchasedItems();
            expect(purchasedItems.length).to.equal(1);
        });
    });
});
