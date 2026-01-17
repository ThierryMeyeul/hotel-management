export default function Logo() {
  return (
    <div className="flex items-center space-x-3">
      <div className="bg-gradient-to-br from-indigo-500 to-pink-500 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg">
        <span className="font-bold">HS</span>
      </div>
      <div>
        <div className="text-xl font-bold">HotelSphere</div>
        <div className="text-sm text-gray-500 -mt-1">Where comfort meets the clouds</div>
      </div>
    </div>
  );
}
