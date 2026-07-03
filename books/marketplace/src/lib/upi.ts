export function generateUPILink(
  upiId: string,
  name: string,
  amount: number,
  note: string
): string {
  const params = new URLSearchParams({
    pa: upiId,
    pn: name,
    am: amount.toString(),
    cu: "INR",
    tn: note,
  });
  return `upi://pay?${params.toString()}`;
}

export function getUPIId(): string {
  return process.env.UPI_ID || "manjunath85@okicici";
}

export function getUPIName(): string {
  return process.env.UPI_NAME || "Manjunath Kalburgi";
}
