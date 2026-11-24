export const stadium = {
  name: 'Yashil maydon',
  daytimePrice: 120_000,
  eveningPrice: 180_000,
  dayEndsAt: 17,
  openAt: 8,
  closeAt: 24,
  phone: '+998 90 123 45 67',
  phoneLink: '+998901234567',
  telegram: 'https://t.me/yashilmaydon',
  address: 'Toshkent shahri, Chilonzor tumani',
  hours: 'Har kuni, 08:00 – 00:00',
}
export const slotPrice = (hour: number) =>
  hour >= stadium.dayEndsAt ? stadium.eveningPrice : stadium.daytimePrice
