const errorHandler = (err, req, res, next) => {
    console.error(`[ERROR] ${err.stack}`);

    const status = err.status || 500;
    const message = process.env.NODE_ENV === 'production' 
        ? 'Une erreur interne est survenue.' 
        : err.message;

    res.status(status).json({
        message,
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack, details: err.details })
    });
};

module.exports = errorHandler;