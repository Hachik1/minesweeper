import logging
from aiogram import Bot, Dispatcher, types
from aiogram.types import Message, WebAppInfo, InlineKeyboardButton, InlineKeyboardMarkup
from aiogram.filters import Command
import asyncio

# ===== НАСТРОЙКИ =====
BOT_TOKEN = "8601842299:AAGdqHz5B_GS67zh7XrDVBG6fEk9mSqu6LQ"
WEBAPP_URL = "https://hachik1.github.io/minesweeper/"
YOUR_USERNAME = "твой_юзернейм"  # ВСТАВЬ СВОЙ ЮЗЕРНЕЙМ БЕЗ @
# =====================

logging.basicConfig(level=logging.INFO)

bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()

@dp.message(Command("start"))
async def cmd_start(message: Message):
    """Отправляет приветствие и кнопку с игрой"""
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="🎮 Играть в Мины", web_app=WebAppInfo(url=WEBAPP_URL))],
        [InlineKeyboardButton(text="👤 Разработчик", url=f"https://t.me/{YOUR_USERNAME}")]
    ])
    
    await message.answer(
        f"👋 Привет, {message.from_user.first_name}!\n\n"
        f"🎯 Это игра «Мины».\n"
        f"Правила: поле 4x4, спрятано 4 мины.\n"
        f"Открывай клетки, не попади на мину!\n\n"
        f"👇 Нажми кнопку, чтобы открыть игру:",
        reply_markup=keyboard
    )

@dp.message(Command("game"))
async def cmd_game(message: Message):
    """Быстрый старт игры"""
    await cmd_start(message)

@dp.message(lambda message: message.web_app_data is not None)
async def web_app_handler(message: Message):
    """Получает данные из игры"""
    data = message.web_app_data.data
    await message.answer(f"📊 Результат: {data}")

async def main():
    """Запуск бота"""
    print("🚀 Бот запущен и готов к работе!")
    await bot.delete_webhook(drop_pending_updates=True)
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main()) 