import { c, s } from "~/utils/styles";
import { Spacer } from "~/components/Space";
import { CMText } from "./CMText";
import { AdminPageLayout } from "./AdminPageLayout";
import { A } from "solid-start";

export const AdminView = () => {
  return (
    <AdminPageLayout>
      <CMText style={s(c.fontSize(48))}>Admin</CMText>
      <Spacer height={24} />
      {/*
      <Link to="/admin/review-move-annotations">
        <CMText style={s(c.fg(c.primaries[50]), c.fontSize(24), c.weightBold)}>
          Review move annotations
        </CMText>
      </Link>
      <Spacer height={24} />
      */}
      <A href="/admin/move-annotations">
        <CMText style={s(c.fg(c.primaries[50]), c.fontSize(24), c.weightBold)}>
          Move annotations
        </CMText>
      </A>
    </AdminPageLayout>
  );
};
