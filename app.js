const products = [
    {
        price: 155,
        alt: 'Candles',
        currency: 'INR',
        productIds: ['x101'],
        urlOfSale: 'https://www.myntra.com',
        productName: 'Candles',
        img: 'https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/candle-on-a-table-with-a-rose-royalty-free-image-1582562759.jpg?crop=1.00xw:0.752xh;0,0.183xh&resize=1200:*'
    },
    {
        price: 799,
        currency: 'INR',
        alt: 'Chair',
        productIds: ['x102'],
        urlOfSale: 'https://www.amazon.in',
        productName: 'Chair',
        img: 'https://cdn.shopify.com/s/files/1/0044/1208/0217/products/CHR2226_Season_Rust_Brown-Biscuit_01_900x.jpg?v=1579784121'
    },
    {
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
    },
    methods: {
        placeOrder(product, index) {
          console.log('Placing order...', product, index);
          const data = {
              productIds: product.productIds,
              urlOfSale: product.urlOfSale,
              price: product.price,
              currency: product.currency,
          }
          this.socket.emit('createOrder', data);
        },
    },
    created() {
        const urlArr = ['https://www.myntra.com', 'https://www.amazon.in', 'https://www.flipkart.com']
        const random = Math.floor(Math.random() * (2-0 + 1) + 0);
        const url = urlArr[random];

        this.products = products;
        this.socket = io(`http://localhost:3003?url=${url}`, { transports: ['websocket', 'polling', 'flashsocket'] });
        this.socket.emit('newConnection', url);
        this.socket.on('ORDER', (order) => {
            console.log('Order Placed is', order);
        });

        this.socket.on('roomCreated', (room) => {
          console.log('New Room Created', room);
        })
    }
})