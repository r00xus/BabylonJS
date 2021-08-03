using BabylonJS.Models;
using System;
using System.Linq;
using System.Web.Mvc;

namespace BabylonJS.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }

        private Random _random { get; set; } = new Random();

        public ActionResult GetSchema()
        {
            var result = new SchemaModel();

            var types = new string[] { "gondola", "tank", "hopper" };

            var trackCount = _random.Next(5, 12);

            for (var i = 1; i < trackCount; i++)
            {
                var track = new Track();

                track.num = i.ToString();

                track.maxCount = _random.Next(10, 50);

                var carCount = _random.Next(10, track.maxCount);

                for (var j = 1; j <= carCount; j++)
                {
                    var car = new Car();

                    car.num = RandomString("1234567890", 5);
                    car.capacity = _random.Next(20, 30);
                    car.type = types[_random.Next(types.Length)];

                    track.cars.Add(car);
                }

                result.tracks.Add(track);
            }


            return Json(result, JsonRequestBehavior.AllowGet);
        }

        private string RandomString(string chars, int length)
        {
            return new string(Enumerable.Repeat(chars, length)
              .Select(s => s[_random.Next(s.Length)]).ToArray());
        }
    }
}