import { sendNotificationToUser } from "@/utils/push-notification";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
	try {
		const { payload, userIds } = await request.json();
		const result = await sendNotificationToUser(payload, userIds);
		return NextResponse.json(result, { status: 200 });
	} catch (error) {
		console.error("Error sending push notifications:", error);
		return NextResponse.json(
			{
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 },
		);
	}
}

/*
// 发送给所有用户
fetch("/api/push/send", {
	method: "POST",
	headers: {
		"Content-Type": "application/json",
	},
	body: JSON.stringify({
		payload: {
			title: "全局通知",
			body: "这是发送给所有用户的通知",
		},
	}),
});

// 发送给特定用户
 fetch('/api/push/send', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    userIds: ['user1', 'user2'],
    payload: {
      title: '个人通知',
      body: '这是发送给特定用户的通知',
    },
  }),
}); */

/* {
  success: true,
  stats: {
    total: 3,
    success: 2,
    failure: 1
  },
  results: [
    { success: true, userId: 'user1' },
    { success: true, userId: 'user2' },
    { success: false, userId: 'user3', error: 'Subscription expired' }
  ]
} */
