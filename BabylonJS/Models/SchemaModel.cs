using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace BabylonJS.Models
{   
    public class Track
    {
        public string num { get; set; }

        public List<Car> cars { get; set; } = new List<Car>();

        public int maxCount { get; set; }
    }

    public class Car
    {
        public string num { get; set; }

        public string type { get; set; }

        public int capacity { get; set; }
    }

    public class SchemaModel
    {
        public List<Track> tracks { get; set; } = new List<Track>();
    }
}