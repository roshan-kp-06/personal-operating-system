"use client";

import { Topbar } from "@/components/layout/topbar";
import { InboxList } from "@/components/inbox/inbox-list";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function InboxPage() {
  return (
    <>
      <Topbar
        title="Inbox"
        subtitle="Manage messages from Slack, email, and manual entries"
      />
      <ScrollArea className="flex-1">
        <div className="p-6">
          <InboxList />
        </div>
      </ScrollArea>
    </>
  );
}
