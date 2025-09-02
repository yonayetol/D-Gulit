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

    mapping(uint256 => Item) public items;
    uint256 public itemCount;
    address public owner;

    event ItemListed(
        uint256 indexed itemId,
        string name,
        uint256 price,
        address indexed seller
    );

    event ItemPurchased(
        uint256 indexed itemId,
        string name,
        uint256 price,
        address indexed seller,
        address indexed buyer
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

    constructor() {
        owner = msg.sender;
        itemCount = 0;
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

        item.buyer = msg.sender;
        item.isSold = true;

        // Transfer ETH to seller
        (bool success, ) = payable(item.seller).call{value: item.price}("");
        require(success, "Transfer to seller failed");

        // Refund excess payment
        if (msg.value > item.price) {
            (bool refundSuccess, ) = payable(msg.sender).call{value: msg.value - item.price}("");
            require(refundSuccess, "Refund failed");
        }

        emit ItemPurchased(_itemId, item.name, item.price, item.seller, msg.sender);
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
}
