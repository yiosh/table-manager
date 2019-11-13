export const tableTypeDeparser = type => {
  let id;
  switch (type) {
    case "circle":
      id = "2";
      break;

    case "square":
      id = "3";
      break;

    case "rectangle":
      id = "4";
      break;

    case "ellipse":
      id = "5";
      break;
  }
  return id;
};

export const tableTypeParser = id => {
  let type;
  switch (id) {
    case "2":
      type = "circle";
      break;

    case "3":
      type = "square";
      break;

    case "4":
      type = "rectangle";
      break;

    case "5":
      type = "ellipse";
      break;
  }
  return type;
};
