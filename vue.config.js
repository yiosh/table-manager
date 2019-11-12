module.exports = {
  publicPath:
    // process.env.NODE_ENV === "production" ? "/v4/fl_app/tableManagerBeta" : "/"
    process.env.NODE_ENV === "production"
      ? "/v4/fl_app/tableManagerBeta"
      : "/v4/fl_app/tableManagerBeta"
};
