import BgsTable from "./components/Table";

export default BgsTable;

export { type BgsTableDefaultProps } from "./components/Table";
export { default as THead } from "./components/THead";
export { default as TBody } from "./components/TBody";
export { default as TFoot} from "./components/TFoot";
export { default as Highlight} from "./components/Highlight";
export * from "./hooks/use-sticky-table";
export * from "./hooks/use-pagination.hook";
export * from "./types";
export * from "./components/Element";
export * from "./components/ResizeColumn";
export { useBgsTable, type BgsTableRef } from "./contexts/Table.context";
export { useBgsTableRow } from "./contexts/TRow.context";
export { useBgsTableColumn } from "./contexts/TCell.context";
export { useBgsTableColumnHead } from "./contexts/THead.context";
export * from "./components/Highlight";

