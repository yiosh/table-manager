import axios from "axios";

let hostname =
  location.hostname == "localhost"
    ? "demo.condivision.cloud"
    : location.hostname;

const apiClient = axios.create({
  baseURL: location.protocol + "//" + hostname,
  withCredentials: false,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json"
  }
});

export default {
  fetchLayout(layoutId) {
    return apiClient.get(
      `/fl_api/tables-v1/?get_tables_board&token=1&board_id=${layoutId}`
    );
  },
  fetchTableTypes() {
    return apiClient.get("/fl_api/tables-v1/?get_table_types&token=1");
  },
  getTables(layoutId) {
    return apiClient.get(
      `/fl_api/tables-v1/?get_tables&token=1&board_id=${layoutId}`
    );
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
    nomeCliente
  }) {
    return apiClient.get(
      `/fl_api/tables-v1/?insert_table&token=1&layout_id=${layoutId}&type_id=${typeId}&table_name=${tableName}&table_number=${tableNumber}&table_group=${tableGroup}&size=${size}&x=${x}&y=${y}&angolare=${angolare}&nome_cliente=${nomeCliente}`
    );
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
    nomeCliente
  }) {
    return apiClient.get(
      `/fl_api/tables-v1/?update_table&token=1&layout_id=${layoutId}&table_id=${id}&type_id=${typeId}&table_name=${tableName}&table_number=${tableNumber}&size=${size}&scale_x=${scaleX}&scale_y=${scaleY}&angolare=${angolare}&nome_cliente=${nomeCliente}`
    );
  },
  deleteTable({ layoutId, tableId }) {
    return apiClient.get(
      `/fl_api/tables-v1/?delete_table&token=1&layout_id=${layoutId}&table_id=${tableId}`
    );
  },
  getGuests(layoutId) {
    return apiClient.get(
      `/fl_api/tables-v1/?get_guests&token=1&layout_id=${layoutId}`
    );
  },
  addGuest(layoutId, tableId, guest) {
    return apiClient.get(
      `/fl_api/tables-v1/?insert_guest&token=1&layout_id=${layoutId}&guest_type=${
        guest.guest_type
      }&table_id=${tableId}&cognome=${guest.cognome}&peoples=${
        guest.peoples
      }&nome=${guest.nome}&baby=${guest.baby}&chairs_only=${
        guest.chairs_only
      }&highchair=${guest.high_chair}&note_intolleranze=${
        guest.note_intolleranze
      }`
    );
  },
  updateGuest(guest) {
    console.log("guest", guest);
    return apiClient.get(
      `/fl_api/tables-v1/?update_guest&token=1&guest_id=${
        guest.id
      }&guest_type=${guest.guest_type}&cognome=${guest.cognome}&peoples=${
        guest.peoples
      }&nome=${guest.nome}&baby=${guest.baby}&chairs_only=${
        guest.chairs_only
      }&highchair=${guest.high_chair}&note_intolleranze=${
        guest.note_intolleranze
      }`
    );
  },
  deleteGuest(guestId) {
    return apiClient.get(
      `/fl_api/tables-v1/?delete_guest&token=1&guest_id=${guestId}`
    );
  }
};
