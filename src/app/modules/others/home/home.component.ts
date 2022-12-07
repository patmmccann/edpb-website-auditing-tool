import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  help_content: 'home'| 'how_the_tool_works' | 'new_analysis' | 'knowledge_base' | 'create_reports' = 'home';

  constructor(
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe((params: Params) => {
      const section = params['section_id'];

      switch(section){
        case 'how_the_tool_works':
          this.help_content = 'how_the_tool_works';
          break;
        case 'new_analysis':
            this.help_content = 'new_analysis';
            break;
        case 'knowledge_base':
          this.help_content = 'knowledge_base';
          break;
        case 'create_reports':
          this.help_content = 'create_reports';
          break;
      }
      window.scroll(0, 0);
    });
    
  }

}
