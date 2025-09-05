// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Marketplace {
    struct Item {
        uint256 id;
        string name;
        string description;
        string imageUrl;
        uint256 price;
        address seller;
        address buyer;
        bool isSold;
        bool exists;
    }

    struct PendingPurchase {
        uint256 itemId;
        address buyer;
        address seller;
        uint256 price;
        uint256 timestamp;
        bool exists;
    }

    mapping(uint256 => Item) public items;
    mapping(uint256 => PendingPurchase) public pendingPurchases;
    uint256 public itemCount;
    uint256 public pendingPurchaseCount;
    address public owner;

    event ItemListed(
        uint256 indexed itemId,
        string name,
        uint256 price,
        address indexed seller
    );

    event PurchaseRequested(
        uint256 indexed itemId,
        string name,
        uint256 price,
        address indexed seller,
        address indexed buyer,
        uint256 pendingPurchaseId
    );

    event PurchaseApproved(
        uint256 indexed itemId,
        string name,
        uint256 price,
        address indexed seller,
        address indexed buyer,
        uint256 pendingPurchaseId
    );

    event PurchaseRejected(
        uint256 indexed itemId,
        address indexed seller,
        address indexed buyer,
        uint256 pendingPurchaseId
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier itemExists(uint256 _itemId) {
        require(items[_itemId].exists, "Item does not exist");
        _;
    }

    modifier itemNotSold(uint256 _itemId) {
        require(!items[_itemId].isSold, "Item is already sold");
        _;
    }

    modifier pendingPurchaseExists(uint256 _pendingPurchaseId) {
        require(pendingPurchases[_pendingPurchaseId].exists, "Pending purchase does not exist");
        _;
    }

    constructor() {
        owner = msg.sender;
        itemCount = 0;
        pendingPurchaseCount = 0;
    }

    function listItem(
        string memory _name,
        string memory _description,
        string memory _imageUrl,
        uint256 _price
    ) public returns (uint256) {
        
        require(_price > 0, "Price must be greater than 0");
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(bytes(_description).length > 0, "Description cannot be empty");
        // imageUrl is optional; allow empty string when seller doesn't provide an image

        itemCount++;
        items[itemCount] = Item({
            id: itemCount,
            name: _name,
            description: _description,
            imageUrl: _imageUrl,
            price: _price,
            seller: msg.sender,
            buyer: address(0),
            isSold: false,
            exists: true
        });

        emit ItemListed(itemCount, _name, _price, msg.sender);
        return itemCount;
    }

    function purchaseItem(uint256 _itemId) 
        public 
        payable 
        itemExists(_itemId) 
        itemNotSold(_itemId) 
    {
        Item storage item = items[_itemId];
        require(msg.value >= item.price, "Insufficient payment");
        require(msg.sender != item.seller, "Seller cannot buy their own item");

        // Create pending purchase
        pendingPurchaseCount++;
        pendingPurchases[pendingPurchaseCount] = PendingPurchase({
            itemId: _itemId,
            buyer: msg.sender,
            seller: item.seller,
            price: item.price,
            timestamp: block.timestamp,
            exists: true
        });

        // ETH stays in contract (escrow) - no transfer needed

        // Refund excess payment
        if (msg.value > item.price) {
            (bool refundSuccess, ) = payable(msg.sender).call{value: msg.value - item.price}("");
            require(refundSuccess, "Refund failed");
        }

        emit PurchaseRequested(_itemId, item.name, item.price, item.seller, msg.sender, pendingPurchaseCount);
    }

    function approvePurchase(uint256 _pendingPurchaseId) 
        public 
        onlyOwner 
        pendingPurchaseExists(_pendingPurchaseId) 
    {
        PendingPurchase storage pendingPurchase = pendingPurchases[_pendingPurchaseId];
        Item storage item = items[pendingPurchase.itemId];
        
        require(!item.isSold, "Item is already sold");

        // Mark item as sold
        item.buyer = pendingPurchase.buyer;
        item.isSold = true;

        // Transfer ETH from contract to seller
        (bool success, ) = payable(pendingPurchase.seller).call{value: pendingPurchase.price}("");
        require(success, "Transfer to seller failed");

        // Remove pending purchase
        delete pendingPurchases[_pendingPurchaseId];

        emit PurchaseApproved(
            pendingPurchase.itemId, 
            item.name, 
            pendingPurchase.price, 
            pendingPurchase.seller, 
            pendingPurchase.buyer, 
            _pendingPurchaseId
        );
    }

    function rejectPurchase(uint256 _pendingPurchaseId) 
        public 
        onlyOwner 
        pendingPurchaseExists(_pendingPurchaseId) 
    {
        PendingPurchase storage pendingPurchase = pendingPurchases[_pendingPurchaseId];
        
        // Refund ETH from contract to buyer
        (bool success, ) = payable(pendingPurchase.buyer).call{value: pendingPurchase.price}("");
        require(success, "Refund to buyer failed");

        // Remove pending purchase
        delete pendingPurchases[_pendingPurchaseId];

        emit PurchaseRejected(
            pendingPurchase.itemId, 
            pendingPurchase.seller, 
            pendingPurchase.buyer, 
            _pendingPurchaseId
        );
    }

    function getItem(uint256 _itemId) 
        public 
        view 
        itemExists(_itemId) 
        returns (
            uint256 id,
            string memory name,
            string memory description,
            string memory imageUrl,
            uint256 price,
            address seller,
            address buyer,
            bool isSold
        ) 
    {
        Item memory item = items[_itemId];
        return (
            item.id,
            item.name,
            item.description,
            item.imageUrl,
            item.price,
            item.seller,
            item.buyer,
            item.isSold
        );
    }

    function getAllItems() public view returns (Item[] memory) {
        Item[] memory allItems = new Item[](itemCount);
        for (uint256 i = 1; i <= itemCount; i++) {
            if (items[i].exists) {
                allItems[i - 1] = items[i];
            }
        }
        return allItems;
    }

    function getAvailableItems() public view returns (Item[] memory) {
        uint256 availableCount = 0;
        
        // Count available items
        for (uint256 i = 1; i <= itemCount; i++) {
            if (items[i].exists && !items[i].isSold) {
                availableCount++;
            }
        }

        Item[] memory availableItems = new Item[](availableCount);
        uint256 index = 0;
        
        // Populate available items
        for (uint256 i = 1; i <= itemCount; i++) {
            if (items[i].exists && !items[i].isSold) {
                availableItems[index] = items[i];
                index++;
            }
        }
        
        return availableItems;
    }

    function getMyListedItems() public view returns (Item[] memory) {
        uint256 myItemsCount = 0;
        
        // Count my items
        for (uint256 i = 1; i <= itemCount; i++) {
            if (items[i].exists && items[i].seller == msg.sender) {
                myItemsCount++;
            }
        }

        Item[] memory myItems = new Item[](myItemsCount);
        uint256 index = 0;
        
        // Populate my items
        for (uint256 i = 1; i <= itemCount; i++) {
            if (items[i].exists && items[i].seller == msg.sender) {
                myItems[index] = items[i];
                index++;
            }
        }
        
        return myItems;
    }

    function getMyPurchasedItems() public view returns (Item[] memory) {
        uint256 purchasedCount = 0;
        
        // Count purchased items
        for (uint256 i = 1; i <= itemCount; i++) {
            if (items[i].exists && items[i].buyer == msg.sender) {
                purchasedCount++;
            }
        }

        Item[] memory purchasedItems = new Item[](purchasedCount);
        uint256 index = 0;
        
        // Populate purchased items
        for (uint256 i = 1; i <= itemCount; i++) {
            if (items[i].exists && items[i].buyer == msg.sender) {
                purchasedItems[index] = items[i];
                index++;
            }
        }
        
        return purchasedItems;
    }

    function getPendingPurchase(uint256 _pendingPurchaseId) 
        public 
        view 
        pendingPurchaseExists(_pendingPurchaseId) 
        returns (
            uint256 itemId,
            address buyer,
            address seller,
            uint256 price,
            uint256 timestamp
        ) 
    {
        PendingPurchase memory pendingPurchase = pendingPurchases[_pendingPurchaseId];
        return (
            pendingPurchase.itemId,
            pendingPurchase.buyer,
            pendingPurchase.seller,
            pendingPurchase.price,
            pendingPurchase.timestamp
        );
    }

    function getAllPendingPurchases() public view returns (PendingPurchase[] memory) {
        PendingPurchase[] memory allPending = new PendingPurchase[](pendingPurchaseCount);
        uint256 index = 0;
        
        for (uint256 i = 1; i <= pendingPurchaseCount; i++) {
            if (pendingPurchases[i].exists) {
                allPending[index] = pendingPurchases[i];
                index++;
            }
        }
        
        return allPending;
    }

    function getPendingPurchasesForItem(uint256 _itemId) public view returns (PendingPurchase[] memory) {
        uint256 count = 0;
        
        // Count pending purchases for this item
        for (uint256 i = 1; i <= pendingPurchaseCount; i++) {
            if (pendingPurchases[i].exists && pendingPurchases[i].itemId == _itemId) {
                count++;
            }
        }

        PendingPurchase[] memory itemPending = new PendingPurchase[](count);
        uint256 index = 0;
        
        // Populate pending purchases for this item
        for (uint256 i = 1; i <= pendingPurchaseCount; i++) {
            if (pendingPurchases[i].exists && pendingPurchases[i].itemId == _itemId) {
                itemPending[index] = pendingPurchases[i];
                index++;
            }
        }
        
        return itemPending;
    }
}
