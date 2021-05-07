'use strict';
(function () {
   $(document).ready(function () {
      // Initialises Tableau Data Extension
      tableau.extensions.initializeAsync().then(function () {
         // Once we initialize we call teh drawChartJS function.
         drawChartJS();
      }, function () { console.log('Error while Initializing: ' + err.toString()); });
   });

   // This javascript function gets data from our worksheet and draws the Doughnut.
   function drawChartJS() {
      // Gets all the worksheets in a Tableau Dashboard
      const worksheets = tableau.extensions.dashboardContent.dashboard.worksheets;
      // Finds a worksheet called worksheetData
      var worksheet = worksheets.find(function (sheet) {
         return sheet.name === "data";
      });
      var image_i = "https://e7.pngegg.com/pngimages/647/460/png-clipart-computer-icons-open-person-family-icon-black-silhouette-black.png"
      var arbre_equipe = {
         "name": "Sondeur",
         "icon": image_i,
         "children": []

      };
      function add_fils(child_l2, name_f, type_image, compteur_fils, data_h) {
         var icon = "";
         if (type_image == "blanc") {
            icon = image_i
         }
         else
            icon = ""
         for (var i = 0; i < compteur_fils; i++) {
            var fils = {
               "name": name_f,
               "children": [],
               "icon": icon
            }
            child_l2.push(fils)
            var nbre_fils = 2
            // if(type_image=="blanc") {
            // search and add children
            for (var j = 0; j < data_h.length; j++) {
               var cin_level2 = data_h[j][0].formattedValue;
               var papa_level2 = data_h[j][1].value;
               if (papa_level2 == name_f) {
                  var fils_2 = {
                     "name": cin_level2,
                     "children": [],
                     "icon": icon
                  }
                  fils["children"].push(fils_2)
                  nbre_fils--;
               }
            }
            for (var k = 0; k < nbre_fils; k++) {
               var fils_2 = {
                  "name": "vide",
                  "children": [],
                  "icon": icon
               }
               fils["children"].push(fils_2)
            }
            //}
         }
      }
      // Call a function on the worksheet Object to get the Summary Data.
      worksheet.getSummaryDataAsync().then(function (sumdata) {
         // Create an empty arrays for our labels and data set.
         var labels = [];
         var data = [];

         // We get our summary data:
         var worksheetData = sumdata.data;
         // We loop through our summary data and hardcode which columns goes into Label
         // and which column goes into the array.
         var equipe1 = worksheetData[0][2];

         // cin, affil, equipe1,role
         var sondeur = "", papa = "", cin = "";
         for (var i = 0; i < worksheetData.length; i++) {
            cin = worksheetData[i][0].formattedValue
            papa = worksheetData[i][1].value
            if (papa.indexOf("null") >= 0 && worksheetData[i][3].value == "sondeur") {
               sondeur = cin
            }
         }
         var compteur_equipe = equipe1.value;
         for (var i = 0; i < worksheetData.length; i++) {
            var cin_level1 = worksheetData[i][0].formattedValue;
            var papa_level1 = worksheetData[i][1].value;
            if (papa_level1.indexOf("null") >= 0 && papa_level1 == sondeur && compteur_equipe != 0) {

               add_fils(arbre_equipe["children"], cin_level1, "blanc", 1, worksheetData)
               compteur_equipe = compteur_equipe - 1;

            }

         }


         // Draw the chart as before.
         var margin = {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
         },
            width = 700 - margin.right - margin.left,
            height = 280 - margin.top - margin.bottom;



         var root = arbre_equipe
         var i = 0,
            duration = 750,
            rectW = 20,
            rectH = 30;

         var tree = d3.layout.tree().nodeSize([rectW, rectH]);
         var diagonal = d3.svg.diagonal()
            .projection(function (d) {
               return [d.x + rectW / 2, d.y + rectH / 2];
            });

         //Redraw for zoom
         function redraw() {
            //console.log("here", d3.event.translate, d3.event.scale);
            svg.attr("transform",
               "translate(" + d3.event.translate + ")"
               + " scale(" + d3.event.scale + ")");
         }

         var zm = d3.behavior.zoom().scaleExtent([1, 3]).on("zoom", redraw)
         var svg = d3.select("#chart").append("svg").attr("width", 700).attr("height", 280)
            .attr("style", "position: absolute;")
            .call(zm)

         var g = svg.append("g")
            .attr("transform", "translate(" + 175 + "," + 0 + ")");

         var div = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 1e-6);

         //necessary so that zoom knows where to zoom and unzoom from
         zm.translate([350, 20]);

         root.x0 = width / 2;
         root.y0 = 0;
         //update(root)
         function collapse(d) {
            if (d.children) {
               d._children = d.children;
               d._children.forEach(collapse);
               d.children = null;
            }
         }

         // Toggle children on click.
         function click(d) {
            /*if (d.children) {
               d._children = d.children;
               d.children = null;
            } else {
               d.children = d._children;
               d._children = null;
            }
            update(d);*/
         }
         function mouseover() {
            div.transition()
               .duration(300)
               .style("opacity", 1);
         }

         function mousemove(d) {
            div
               .text("Info about " + d.name + ":" + d.info)
               .style("left", (d3.event.pageX) + "px")
               .style("top", (d3.event.pageY) + "px");
         }

         function update(source) {

            // Compute the new tree layout.
            var nodes = tree.nodes(root).reverse(),
               links = tree.links(nodes);

            // Normalize for fixed-depth.
            nodes.forEach(function (d) {
               d.y = d.depth * 50;
            });

            // Update the nodes…
            var node = svg.selectAll("g.node")
               .data(nodes, function (d) {
                  return d.id || (d.id = ++i);
               });

            node.append("image")
               .attr("xlink:href", function (d) { return d.icon; })
               //.attr("x", "-  12px")
               //.attr("y", "-12px")
               .attr("width", rectW)
               .attr("height", rectH)
               .on("mouseover", mouseover)
               .on("mousemove", function (d) { mousemove(d); })
               .on("mouseout", mouseout);
            // Enter any new nodes at the parent's previous position.
            var nodeEnter = node.enter().append("g")
               .attr("class", "node")
               .attr("transform", function (d) {
                  return "translate(" + source.x0 + "," + source.y0 + ")";
               })
               .on("click", click)



            /*nodeEnter.append("text")
               .attr("x", rectW / 2)
               .attr("y", rectH / 2)
               .attr("dy", ".35em")
               .attr("text-anchor", "middle")
               .text(function (d) {
                  return d.name;
               });*/

            // Transition nodes to their new position.
            var nodeUpdate = node.transition()
               .duration(duration)
               .attr("transform", function (d) {
                  return "translate(" + d.x + "," + d.y + ")";
               });

            /*nodeUpdate.select("rect")
               .attr("width", rectW)
               .attr("height", rectH)
               .attr("stroke", "black")
               .attr("stroke-width", 1)
               .style("fill", function (d) {
                  return d._children ? "lightsteelblue" : "#fff";
               });

            nodeUpdate.select("text")
               .style("fill-opacity", 1);*/

            // Transition exiting nodes to the parent's new position.
            var nodeExit = node.exit().transition()
               .duration(duration)
               .attr("transform", function (d) {
                  return "translate(" + source.x + "," + source.y + ")";
               })
               .remove();

            /* nodeExit.select("rect")
                .attr("width", rectW)
                .attr("height", rectH)
                //.attr("width", bbox.getBBox().width)""
                //.attr("height", bbox.getBBox().height)
                .attr("stroke", "black")
                .attr("stroke-width", 1);*/

            nodeExit.select("text");

            // Update the links…
            var link = svg.selectAll("path.link")
               .data(links, function (d) {
                  return d.target.id;
               });

            // Enter any new links at the parent's previous position.
            link.enter().insert("path", "g")
               .attr("class", "link")
               .attr("x", rectW / 2)
               .attr("y", rectH / 2)
               .attr("d", function (d) {
                  var o = {
                     x: source.x0,
                     y: source.y0
                  };
                  return diagonal({
                     source: o,
                     target: o
                  });
               });

            // Transition links to their new position.
            link.transition()
               .duration(duration)
               .attr("d", diagonal);

            // Transition exiting nodes to the parent's new position.
            link.exit().transition()
               .duration(duration)
               .attr("d", function (d) {
                  var o = {
                     x: source.x,
                     y: source.y
                  };
                  return diagonal({
                     source: o,
                     target: o
                  });
               })
               .remove();

            // Stash the old positions for transition.
            nodes.forEach(function (d) {
               d.x0 = d.x;
               d.y0 = d.y;
            });
         }




         //root.children.forEach(collapse);
         update(root);
         root.children.forEach(update);
         //d3.select("#body").style("height", "800px");
         function mouseout() {
            div.transition()
               .duration(300)
               .style("opacity", 1e-6);
         }

      });
   }


})();

