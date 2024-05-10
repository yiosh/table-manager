import axios from "axios";
import { host } from "@/localHost";

let hostname = host;
let protocol = "https";
if (!location.hostname.includes("localhost")) {
  hostname = location.hostname;
}
// location.hostname == "localhost"
//   ? "calderonimartini.condivision.cloud"
//   : location.hostname;
const baseURL = protocol + "://" + hostname;
let endpoint =
  location.hostname !== "localhost"
    ? "/fl_api/tables-v3/?"
    : "/fl_api/tables-dev/?";
let simpleEndpoint =
  location.hostname !== "localhost"
    ? "/fl_api/tables-v3/"
    : "/fl_api/tables-dev/";

const apiClient = axios.create({
  baseURL,
  withCredentials: false,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

const CDNClient = axios.create({
  baseURL: "https://mysql.condivision.cloud",
  withCredentials: false,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

export default {
  fetchLabels(language) {
    return CDNClient.get(`/labels/?${language}`);
  },
  fetchLayout(layoutId) {
    return apiClient.get(
      `${endpoint}get_tables_board&token=1&board_id=${layoutId}`
    );
  },
  fetchTableTypes() {
    return apiClient.get(`${endpoint}get_table_types&token=1`);
  },
  getTables(layoutId) {
    return apiClient.get(`${endpoint}get_tables&token=1&board_id=${layoutId}`);
  },
  addTable({
    layoutId,
    typeId,
    tableName,
    tableNumber,
    tableGroup,
    size,
    x,
    y,
    angolare,
    nomeCliente,
    borderColor,
    backgroundColor,
    borderType,
    maxSeats,
    noteCliente,
  }) {
    console.log("back", backgroundColor, "border", borderColor);
    borderColor = borderColor.replace("#", "");
    backgroundColor = backgroundColor.replace("#", "");

    return apiClient.get(
      `${endpoint}insert_table&token=1&layout_id=${layoutId}&type_id=${typeId}&table_name=${tableName}&table_number=${tableNumber}&table_group=${tableGroup}&size=${size}&x=${x}&y=${y}&angolare=${angolare}&nome_cliente=${nomeCliente}&border_type=${borderType}&border_color=${borderColor}&background_color=${backgroundColor}&max_seats=${maxSeats}&note_tavolo=${noteCliente}`
    );
  },
  duplicateTable({
    layoutId,
    typeId,
    tableName,
    tableNumber,
    tableGroup,
    size,
    x,
    y,
    angolare,
    nomeCliente,
    borderColor,
    backgroundColor,
    borderType,
    maxSeats,
    noteCliente,
    scaleX,
    scaleY,
  }) {
    console.log("back", backgroundColor, "border", borderColor);
    borderColor = borderColor.replace("#", "");
    backgroundColor = backgroundColor.replace("#", "");

    let params = `duplicate_table&token=1&layout_id=${layoutId}&type_id=${typeId}&table_name=${tableName}&table_number=${tableNumber}&table_group=${tableGroup}&size=${size}&x=${x}&y=${y}&angolare=${angolare}&nome_cliente=${nomeCliente}&border_type=${borderType}&border_color=${borderColor}&background_color=${backgroundColor}&max_seats=${maxSeats}&note_tavolo=${noteCliente}`;

    if (scaleX) {
      params += `&scale_x=${scaleX}`;
    }
    if (scaleY) {
      params += `&scale_y=${scaleY}`;
    }

    return apiClient.get(`${endpoint}${params}`);
  },
  updateTable({
    layoutId,
    id,
    typeId,
    tableName,
    tableNumber,
    size,
    scaleX,
    scaleY,
    angolare,
    nomeCliente,
    borderColor,
    backgroundColor,
    borderType,
    maxSeats,
    noteCliente,
  }) {
    let params = "";
    if (layoutId) {
      params += `&layout_id=${layoutId}`;
    }
    if (id) {
      params += `&table_id=${id}`;
    }
    if (typeId) {
      params += `&type_id=${typeId}`;
    }
    if (tableName) {
      params += `&table_name=${tableName}`;
    }
    if (tableNumber) {
      params += `&table_number=${tableNumber}`;
    }
    if (size) {
      params += `&size=${size}`;
    }
    if (scaleX) {
      params += `&scale_x=${scaleX}`;
    }
    if (scaleY) {
      params += `&scale_y=${scaleY}`;
    }
    if (angolare) {
      params += `&angolare=${angolare}`;
    }
    if (nomeCliente) {
      params += `&nome_cliente=${nomeCliente}`;
    }
    if (borderColor) {
      params += `&border_color=${borderColor}`;
    }
    if (backgroundColor) {
      params += `&background_color=${backgroundColor}`;
    }
    if (borderType) {
      params += `&border_type=${borderType}`;
    }
    if (maxSeats) {
      params += `&max_seats=${maxSeats}`;
    }
    if (noteCliente) {
      params += `&note_tavolo=${noteCliente}`;
    }
    return apiClient.get(`${endpoint}update_table&token=1&${params}`);
  },
  updateClientName({ layoutId, id, nomeCliente }) {
    let params = "";
    if (layoutId) {
      params += `&layout_id=${layoutId}`;
    }
    if (id) {
      params += `&table_id=${id}`;
    }

    if (nomeCliente) {
      params += `&nome_cliente=${nomeCliente}`;
    }

    return apiClient.get(`${endpoint}update_client_name&token=1&${params}`);
  },
  updateClientNote({ layoutId, id, noteCliente }) {
    let params = "";
    if (layoutId) {
      params += `&layout_id=${layoutId}`;
    }
    if (id) {
      params += `&table_id=${id}`;
    }

    if (noteCliente) {
      params += `&note_tavolo=${noteCliente}`;
    }

    return apiClient.get(`${endpoint}update_table_note&token=1&${params}`);
  },
  updateNumeroAlternativo({ layoutId, id, numeroAlternativo }) {
    let params = "";
    if (layoutId) {
      params += `&layout_id=${layoutId}`;
    }
    if (id) {
      params += `&table_id=${id}`;
    }

    if (numeroAlternativo) {
      params += `&numero_alternativo=${numeroAlternativo}`;
    }

    return apiClient.get(
      `${endpoint}update_numero_alternativo&token=1${params}`
    );
  },
  deleteTable({ layoutId, tableId }) {
    return apiClient.get(
      `${endpoint}delete_table&token=1&layout_id=${layoutId}&table_id=${tableId}`
    );
  },
  getGuestTypes() {
    return apiClient.get(`${endpoint}get_guest_types&token=1`);
  },
  getGuests(layoutId) {
    return apiClient.get(`${endpoint}get_guests&token=1&layout_id=${layoutId}`);
  },
  addGuest(layoutId, tableId, guest) {
    // let menus = "";

    // if (guest.menu1) {
    //   menus = `&menu1=${guest.menu1}&menu2=${guest.menu2}&menu3=${
    //     guest.menu3
    //   }&menu4=${guest.menu4}`;
    // }
    let menus = `&menu1=${guest.menu1}&menu2=${guest.menu2}&menu3=${
      guest.menu3
    }&menu4=${guest.menu4}`;
    return apiClient.get(
      `${endpoint}insert_guest&token=1&layout_id=${layoutId}&guest_type=${
        guest.guest_type
      }&table_id=${tableId}&cognome=${guest.cognome}&peoples=${
        guest.peoples
      }&nome=${guest.nome}&baby=${guest.baby}&chairs_only=${
        guest.chairs_only
      }&highchair=${guest.high_chair}&note_intolleranze=${
        guest.note_intolleranze
      }${menus}`
    );
  },
  updateGuest(guest) {
    console.log("guest", guest);
    let menus = `&menu1=${guest.menu1}&menu2=${guest.menu2}&menu3=${
      guest.menu3
    }&menu4=${guest.menu4}`;
    // if (guest.menu1) {
    //   menus = `&menu1=${guest.menu1}`;
    // }
    // if (guest.menu2) {
    //   menus = `&menu2=${guest.menu2}`;
    // }
    // if (guest.menu3) {
    //   menus = `&menu3=${guest.menu3}`;
    // }
    // if (guest.menu4) {
    //   menus = `&menu4=${guest.menu4}`;
    // }
    return apiClient.get(
      `${endpoint}update_guest&token=1&guest_id=${guest.id}&guest_type=${
        guest.guest_type
      }&cognome=${guest.cognome}&peoples=${guest.peoples}&nome=${
        guest.nome
      }&baby=${guest.baby}&chairs_only=${guest.chairs_only}&highchair=${
        guest.high_chair
      }&note_intolleranze=${guest.note_intolleranze}${menus}&table_id=${
        guest.table_id
      }`
    );
  },
  deleteGuest(guestId) {
    return apiClient.get(`${endpoint}delete_guest&token=1&guest_id=${guestId}`);
  },
  getResume(boardId) {
    return apiClient.get(
      `${endpoint}get_tables_report&token=1&board_id=${boardId}`
    );
  },
  getOtherTables({ eventoId, layoutId, tableId, tableNumber }) {
    return apiClient.get(
      `${endpoint}get_tables_from_other&token=1&evento_id=%{${eventoId}}%&layout_id=${layoutId}&table_id=${tableId}&table_number=${tableNumber}`
    );
  },
  copyGuests(params) {
    return apiClient.get(`${simpleEndpoint}?copy_guests_from_table${params}`);
  },
};
