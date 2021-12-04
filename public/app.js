const API_URL = 'https://3e7a-117-223-63-195.ngrok.io';
// const API_URL = 'http://localhost:3003';
const products = [{
        price: 155,
        alt: 'Candles',
        currency: 'INR',
        productIds: ['x101'],
        urlOfSale: 'https://www.myntra.com',
        productName: 'Candles',
        img: 'https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/candle-on-a-table-with-a-rose-royalty-free-image-1582562759.jpg?crop=1.00xw:0.752xh;0,0.183xh&resize=1200:*'
    },{
        price: 799,
        currency: 'INR',
        alt: 'Chair',
        productIds: ['x102'],
        urlOfSale: 'https://www.amazon.in',
        productName: 'Chair',
        img: 'https://cdn.shopify.com/s/files/1/0044/1208/0217/products/CHR2226_Season_Rust_Brown-Biscuit_01_900x.jpg?v=1579784121'
    },{
        price: 250,
        currency: 'INR',
        productIds: ['x103'],
        alt: 'Books',
        urlOfSale: 'https://www.flipkart.com',
        productName: 'Books',
        img: 'https://api.time.com/wp-content/uploads/2015/06/521811839-copy.jpg?w=824&quality=70'
    }
];
const app = new Vue({
    el: '#v-app',
    data: {
        products: [],
        title: 'ShopIt Using Websockets',
        payload: {},
        socket: null,
        newOrderPlacedFlag: false,
        newOrderPlaced: {},
        queryURL: '',
        showCart: true,
        showOrders: false,
        orders: [],
        currentPage: 0,
        disablePrevBtn: true,
        loading: false,
        newProductPlaced: false,
        orderPlaceFailed: false,
        errorMessage: '',
    },
    methods: {
        showOrderPlacedPopup() {
          this.newProductPlaced = true;
          setTimeout(() => {
            this.newProductPlaced = false;
          }, 5000);
        },
        showOrderPlacedFailedPopup() {
          this.orderPlaceFailed = true;
          setTimeout(() => {
            this.orderPlaceFailed = false;
          }, 5000);
        },
        async placeOrder(product, index) {
          console.log('Placing order...', product, index);
          this.loading = true;
          const data = {
              productIds: product.productIds,
              urlOfSale: product.urlOfSale,
              price: product.price,
              currency: product.currency,
          };
          try {
              const rawResponse = await fetch(`${API_URL}/order`, {
                method: 'POST',
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
              });
              const content = await rawResponse.json();
              this.loading = false;
              console.log('Order Created on DB if accepted!!!!!', content);
              if(content._id) {
                this.showOrderPlacedPopup();
              } else {
                this.errorMessage = content.message;
                this.showOrderPlacedFailedPopup();
              }
          } catch(err) {
            this.loading = false;
            console.log('Some error occured in placeOrder!', err);
          }
        },
        async searchOrders(page = 0, limit = 5) {
           this.loading = true;
            try {
            const orders = await fetch(`${API_URL}/order?page=${page}&limit=${limit}&orderBy=orderDate`, {
              method: 'GET',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              }
            });
            this.orders = await orders.json();
            this.loading = false;
            console.log('Orders fetched!', this.orders)
          } catch(err) {
            this.loading = false;
            console.log('Some error occured in searchOrders!', err);
          }
        },
        closePopup() {
            this.newOrderPlacedFlag = false;
            this.newOrderPlaced = {};
        },
        handleShowCart() {
          this.showCart = true;
          this.showOrders = false;
        },
        async loadPrevious() {
          if (this.disablePrevBtn) {
            return;
          }
          if (this.currentPage > 0) {
            this.currentPage -= 1;
          }
          this.disablePrevBtn = this.currentPage === 0;
          await this.searchOrders(this.currentPage);
        },
        async loadNext() {
          this.currentPage += 1;
          this.disablePrevBtn = this.currentPage === 0;
          await this.searchOrders(this.currentPage);
        },
        async handleShowOrders() {
          this.showOrders = true;
          this.showCart = false;
          await this.searchOrders();
        },
    },
    created() {
        const urlArr = ['https://www.myntra.com', 'https://www.amazon.in', 'https://www.flipkart.com']
        const random = Math.floor(Math.random() * 3);
        const url = urlArr[random];
        this.products = products;

        this.socket = io(`${API_URL}?url=${url}`, { transports: ['websocket', 'polling', 'flashsocket'] });
        this.socket.emit('newConnection', url);
        this.queryURL = url;
        this.newOrderPlacedFlag = false;

        this.socket.on('order', (order) => {
            console.log('Order Placed is', order);
            this.newOrderPlacedFlag = true;
            this.newOrderPlaced = {
                urlOfSale: order.urlOfSale,
                price: order.price,
                currency: order.currency,
                productIds: order.productIds
            };
        });

        this.socket.on('roomCreated', (room) => {
          console.log('New Room Created', room);
        });
    }
})