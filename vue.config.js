module.exports = {
  indexPath: "index.php",
  publicPath:
    // process.env.NODE_ENV === "production" ? "/v4/fl_app/tableManagerBeta" : "/"
    process.env.NODE_ENV === "production"
      ? "/v5/tableManager"
      : "/v5/tableManager"
};
