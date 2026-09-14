import StateMessage from "./StateMessage";

export default function SaveFeedback({ mutation, success = "Changes saved." }) {
  if (mutation.isPending) return <StateMessage title="Saving changes…" detail="Please wait while your changes are being saved." />;
  if (mutation.isError) return <StateMessage tone="error" title="Changes were not saved" detail={mutation.error?.message || "Please try again."} />;
  if (mutation.isSuccess) return <StateMessage title={success} detail="The latest saved values are now shown on this page." />;
  return null;
}
