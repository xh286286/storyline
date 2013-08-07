d3.storyline = function() {
  var storyline = {},
      personHeight = 24,
      personPadding = 4,
      size = [300, 300],
      people = [],
      topics = [],
      links = [],
      slots = []
      ;

  storyline.size = function(_) {
    if (!arguments.length) return size;
    size = _;
    return storyline;
  };
  
  storyline.personHeight = function(_) {
    if (!arguments.length) return personHeight;
    personHeight = +_;
    return storyline;
  };

  storyline.personPadding = function(_) {
    if (!arguments.length) return personPadding;
    personPadding = +_;
    return storyline;
  };

  storyline.people = function(_) {
    if (!arguments.length) return people;
    people = _;
    return storyline;
  };

  storyline.topics = function(_) {
    if (!arguments.length) return topics;
    topics = _;
    return storyline;
  };

  storyline.links = function() {
    return links;
  };

  storyline.layout = function() {

  	intialTopics();
    initalLinks();
    computeTopicPeopleOrder();
    computerLinks();
    computeSlotDepths(iterations);
    scaleComponents();
    return storyline;
  };
  
  storyline.relayout = function() {
  	
    scaleComponents();
    return storyline;
  };

  
  storyline.link = function() {
    var curvature = .5;

    function link(d) {
      var x0 = d.source.x + d.source.dx,
          x1 = d.target.x,
          xi = d3.interpolateNumber(x0, x1),
          x2 = xi(curvature),
          x3 = xi(1 - curvature),
          y0 = d.source.y + d.sy + d.dy / 2,
          y1 = d.target.y + d.ty + d.dy / 2;
      return "M" + x0 + "," + y0
           + "C" + x2 + "," + y0
           + " " + x3 + "," + y1
           + " " + x1 + "," + y1;
    }

    link.curvature = function(_) {
      if (!arguments.length) return curvature;
      curvature = +_;
      return link;
    };

    return link;
  };
  function intialTopics() { 
  	var i,j;
    	topics.sort(comp1);
	  	function comp1(a,b) { return a.begin - b.begin; }
	  	var m = topics.length;
      int totslots = 0;
	  	for ( i = 0; i<m; i++) {
        var temp = topics[i].participants;
        for ( j = 0; j< temp.length; j++) {
            var index = temp[j];
            temp[j] = {};
            temp[j].index = index;
            temp[j].person = people[index];
        }	  	  	
        var s = topics[i].slot;
        if (s+1 > totslots) totslots = s+1;
        if (slots[s] === undefined) {
          slots[s] = {};
          slots[s].height = temp.length;
        }
        else {
          if (temp.length > slots[s].length) slots[s].length = temp.length;
        }
	  	}
      for (i=0; i<totslots; i++) {
        if (slots[s] === undefined) {
          slots[s] = {"length":0};
      }
  }
	function intialLinks() {
  	var i, j,
  			n = people.length;
  	var m = topics.length;
  	links = [];
    var lastEnd = people.slice();
    for ( i = 0; i<m; i++) {
      var temp = topics[i].participants;
      for (j = 0; j<temp.length; j++) {
        var p = temp[j].index;
        var newlink = {};
        newlink.left = lastEnd[p];
        lastEnd.right = newlink;
        temp[j].left= newlink;
        newlink.right = temp[j];
        links.push(newlink);
        lastEnd[p] = temp[j];
      }
    }
    for ( i =0; i<n; i++) {
      var newlink = {};
      newlink.left = lastEnd[p];
      lastEnd.right = newlink;
      people[i].left= newlink;
      newlink.right = people[i];
      links.push(newlink);
    }
  }
  function computeTopicPeopleOrder() {
    var i, j,
        n = people.length;
    var m = topics.length;
    order = [];
    for (i=0; i<n; i++) {
      order[i] = {};
      order[i].a = 0;
      order[i].b = i;
    }
    for (i =0 ; i<m; i++) {

    }    
  }
}; 