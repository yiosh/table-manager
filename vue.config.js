module.exports = {
  indexPath: "index.php",
  devServer: {
    https: true,
  },
  publicPath:
    // process.env.NODE_ENV === "production" ? "/v4/fl_app/tableManagerBeta" : "/"
    process.env.NODE_ENV === "production" ? "/v5/tableManager" : "/",
};
