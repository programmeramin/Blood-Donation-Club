// middleware/errorHandler.js

// Error handling middleware
const errorHandler = (err, req, res, next) => {
    // যদি response এর status code আগে set না থাকে তাহলে 500 ধরে নেবে
    const status = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

    res.status(status).json({
        success: false,
        message: err.message,
        // stack trace শুধু development mode এ দেখাবে
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
};

export default errorHandler;
