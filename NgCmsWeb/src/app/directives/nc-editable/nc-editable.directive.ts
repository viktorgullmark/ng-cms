import { Directive, ElementRef, Input, OnInit } from '@angular/core';
import { ContentService } from './../../services/content-service/content.service';
import { ContentCreateModel } from './../../models/content-create.model';
import { ContentModel } from './../../models/content.model';
import { Router } from '@angular/router';
import { AuthService } from './../../services/auth-service/auth.service';
import { newGuid } from './../../helpers/guid-helper';

@Directive({ selector: '[ncEditable]' })

export class NcEditableDirective implements OnInit {
    @Input('ncEditable') ncName: string;
    editLink: string;
    contentId: string;
    content: ContentModel;
    foundContent: ContentModel;
    constructor(private element: ElementRef, private contentService: ContentService,
        private router: Router, private authService: AuthService) {
    }

    ngOnInit() {
        this.foundContent = this.contentService.contentArr.find(c => c.name === this.ncName);
        this.initContent();
    }

    initContent() {
        if (this.authService.isLoggedIn()) {
            if (this.foundContent === undefined) {
                const content = new ContentCreateModel().deserialize({
                    name: this.ncName,
                    content: this.element.nativeElement.innerHTML,
                    path: this.router.url
                });
                this.contentService.createContent(content).subscribe(res => {
                    this.content = new ContentModel().deserialize(content);
                    this.content.guid = res;
                    this.appendLink();
                });
            } else {
                this.content = this.foundContent;
                this.appendLink();
            }
        } else {
            this.element.nativeElement.innerHTML = this.foundContent.content;
        }
    }

    appendLink() {
        const elementId = newGuid();
        this.editLink = '/admin/edit-content/' + this.content.guid;
        this.element.nativeElement.innerHTML =
            '<a class="edit-link pull-right" href="' + this.editLink + '" id="' + elementId + '">' +
            '<i class="fa fa-pencil" style="padding-right: 5px;" aria-hidden="true"></i></a>' +
            this.content.content;
        this.element.nativeElement.classList.add('edit-area');
        $('#' + elementId).click(e => {
            e.preventDefault();
            this.router.navigate(['/admin/edit-content', this.content.guid], { queryParams: { returnUrl: this.router.url }})
        });

        const foundContent = this.contentService.contentArr.find(c => c.guid === this.content.guid);

        if (foundContent === undefined) {
            this.contentService.contentArr.push(this.content);
        }
    }
}