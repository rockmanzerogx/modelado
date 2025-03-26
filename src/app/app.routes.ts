import { Routes } from '@angular/router';
import { CuadradoComponent } from './page/cuadrado/cuadrado.component';
import { ProductoComponent } from './page/producto/producto.component';
import { LinealComponent } from './page/lineal/lineal.component';
import { MultiplicativoComponent } from './page/multiplicativo/multiplicativo.component';
import { MediasComponent } from './prueba/medias/medias.component';
import { TablaNormalComponent } from './prueba/tablanormal/tablanormal.component';
import { Variablealeatoria1Component } from './prueba/variablealeatoria1/variablealeatoria1.component';
import { SeriesComponent } from './prueba/series/series.component';

export const routes: Routes = [
    {path: 'cuadrado', component: CuadradoComponent},
    {path: 'producto', component: ProductoComponent},
    {path: 'lineal', component: LinealComponent},
    {path: 'multiplicativo', component: MultiplicativoComponent},
    {path: '', redirectTo: '/cuadrado', pathMatch: 'full'},
    {path: 'medias', component: MediasComponent},
    {path: 'tablanormal', component: TablaNormalComponent},
    {path: 'Ver1VA', component: Variablealeatoria1Component},
    {path: 'series', component: SeriesComponent},
    //{path: '**', component: PageNotFoundComponent}

];
